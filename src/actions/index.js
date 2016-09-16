import _assign from 'lodash/assign';
import _reduce from 'lodash/reduce';
import _isEmpty from 'lodash/isEmpty';
import _forEach from 'lodash/forEach';
import _keys from 'lodash/keys';
import _property from 'lodash/property';
import invariant from 'invariant';

import { SET_INPUT, VALIDATING } from './actionTypes';
import { FORM_KEY, getReduxMountPoint } from '../util/helpers';
import log from '../util/log';
import { getDefaultInputs } from '../reducers';

function _getInputsStateFromGlobal(inputConfig, state) {
    const mountPoint = getReduxMountPoint(inputConfig);

    const inputsState = _property(mountPoint)(state);
    invariant(inputsState, `[redux-inputs]: no state found at '${mountPoint}', check your reducers to make sure it exists or change reduxMountPoint in your inputConfig.`);
    return inputsState;
}

function _filterUnknownInputs(inputConfig, inputs) {
    // Only update known inputs
    return _reduce(inputs, (result, value, key) => {
        if (!inputConfig[key]) {
            log.error(key + ' is not a valid input.');
        } else {
            result[key] = value;
        }
        return result;
    }, {});
}

function _clientSideValidate(inputConfig, inputs, state) {
    const inputsState = _getInputsStateFromGlobal(inputConfig, state);
    return _reduce(inputs, (result, value, key) => {
        let { validator, asyncValidator } = inputConfig[key];
        let newInputState = validator ? validator(value, inputsState, state) : true,
            prev = inputsState[key] && inputsState[key].value,
            newInputStateType = typeof newInputState;

        if (!newInputState || newInputStateType === 'boolean') {
            if (newInputState) {  // True returned, input valid
                result[key] = {
                    value: value,
                    validating: !!asyncValidator // Now validating if async validator exists
                };
            } else { // False returned, input invalid
                result[key] = {
                    value: prev,
                    error: value || '',
                    validating: false // Not going to run async validator if invalid
                };
            }
        } else if (newInputStateType === 'object') { // Object returned, set input to it
            result[key] = newInputState;
        } else {
            log.error(`value returned from validator must be a boolean representing valid/invalid, or an object representing ${key}\'s new state. Got ${newInputStateType} instead.`);
        }

        return result;
    }, {});
}

function _asyncValidate(inputConfig, inputs, state, dispatch) {
    const inputsState = _getInputsStateFromGlobal(inputConfig, state);
    let promises = [],
        hasAsync = false;

    // Async validation from inputConfig
    _forEach(inputs, (input, key) => {
        let { asyncValidator } = inputConfig[key];
        let { error, value } = input;
        if (asyncValidator && typeof error === 'undefined' && typeof value !== 'undefined') {
            let prev = inputsState[key] && inputsState[key].value;

            hasAsync = true;
            // asyncValidators return promises, which resolve if input is valid.
            promises.push(asyncValidator(value, inputsState, state, dispatch).then(
                // Resolved
                () => {
                    let result = {
                        [key]: {value}
                    };
                    dispatch(setInput(inputConfig, result));
                    return result;
                },

                // Rejected
                (newInputState) => {
                    let result,
                        newInputStateType = typeof newInputState;

                    if (!newInputState) {  // No newInputState value returned
                        result = {
                            [key]: {
                                value: prev,
                                error: value
                            }
                        };
                    } else if (newInputStateType === 'object') {
                        result = {
                            [key]: newInputState
                        };
                    } else {
                        log.error(`newInputState value passed to asyncValidator promise reject must be an object representing ${key}\'s new state (or undefined). Got ${newInputStateType} instead.`);
                    }
                    dispatch(setInput(inputConfig, result));
                    return result;
                })
            );
        } else {
            promises.push(Promise.resolve({
                [key]: input
            }));
        }
    });

    if (hasAsync) {
        dispatch(validating(inputConfig, true));
    }

    return new Promise((resolve, reject) => {
        Promise.all(promises).then((results) => {
            let finalResults = _reduce(results, (result, value) => _assign(result, value), {});
            if (hasAsync) {
                dispatch(validating(inputConfig, false));
            }
            const erroredInputs = _haveErrors(finalResults);
            if (erroredInputs) {
                reject(erroredInputs);
            }
            resolve(finalResults);
        }, (e) => {
            // Errors should not occur here
            log.error('Unhandled promise error. Resolve your asyncValidators.');
            console.error(e);
            reject();
        });
    });
}

function _haveErrors(inputs) {
    const erroredInputs = _reduce(inputs, (result, input, key) => {
        if (typeof input.error !== 'undefined') {
            result[key] = input;
        }
        return result;
    }, {});

    return _isEmpty(erroredInputs) ? false : erroredInputs;
}

// Creates actions with meta information attached
function _createActionWithMeta(inputConfig, action) {
    return {
        ...action,
        meta: {
            reduxMountPoint: getReduxMountPoint(inputConfig)
        }
    };
}

export function validating(inputConfig, force) {
    return _createActionWithMeta(inputConfig, {
        type: VALIDATING,
        payload: force
    });
}

/**
 * Sets inputs' states without validation
 *
 * `update` example:
 *  {
 *      email: {
 *          value: 'asdf@asdf.com'
 *      }
 *  }
 */
export function setInput(inputConfig, update) {
    return _createActionWithMeta(inputConfig, {
        type: SET_INPUT,
        payload: update,
        error: !!_haveErrors(update)
    });
}

export function resetInputs(inputConfig) {
    return setInput(inputConfig, getDefaultInputs(inputConfig));
}

/**
 * Validates the current state of inputs corresponding to the given keys
 *
 * @param inputConfig
 * @param inputKeys {Array}
 * @returns {Thunk}
 */
export function validateInputs(inputConfig, inputKeys) {
    return (dispatch, getState) => {
        const inputsState = _getInputsStateFromGlobal(inputConfig, getState());
        const keys = inputKeys || _keys(inputsState);
        const inputsToValidate = _reduce(keys, (result, key) => {
            if (key === FORM_KEY) {
                return result;
            }
            let input = inputsState[key];
            if (inputConfig[key] && input) {
                result[key] = typeof input.error !== 'undefined' ? input.error : input.value;
            }
            return result;
        }, {});
        const updateAndValidateActionCreator = updateAndValidate(inputConfig, inputsToValidate);
        return updateAndValidateActionCreator(dispatch, getState);
    };
}

export function updateAndValidate(inputConfig, update) {
    return (dispatch, getState) => {
        let inputs = _filterUnknownInputs(inputConfig, update);

        if (_isEmpty(inputs)) {
            return Promise.resolve();
        }

        // Parse and client-side validate inputs and dispatch result
        let results = _clientSideValidate(inputConfig, inputs, getState());

        dispatch(setInput(inputConfig, results));

        return _asyncValidate(inputConfig, results, getState(), dispatch);
    };
}

/**
 * Creates a reusable thunk for setting and validating inputs
 *
 * @param inputConfig
 * @returns {Function}
 */
export function createInputsThunk(inputConfig) {
    return update => updateAndValidate(inputConfig, update);
}
