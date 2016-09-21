import _pick from 'lodash/pick';
import _assign from 'lodash/assign';
import _reduce from 'lodash/reduce';
import _forEach from 'lodash/forEach';
import _isEmpty from 'lodash/isEmpty';
import _keys from 'lodash/keys';
import _property from 'lodash/property';
import _isEqual from 'lodash/isEqual';
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

export function _setInput(inputConfig, update) {
    return _createActionWithMeta(inputConfig, {
        type: SET_INPUT,
        payload: update,
        error: !!_haveErrors(update)
    });
}

function _fireChanges(inputConfig, update, inputsState, state, dispatch) {
    _forEach(update, (input, key) => {
        const { onChange } = inputConfig[key] || {};
        if (onChange) {
            onChange(input, inputsState, state, dispatch);
        }
    });
}

/**
 * Sets inputs' states without validation
 *
 * Also fires onChange callbacks for changed inputs
 *
 * `update` example:
 *  {
 *      email: {
 *          value: 'asdf@asdf.com'
 *      }
 *  }
 */
export function setInput(inputConfig, update, suppressChange) {
    return (dispatch, getState) => {
        dispatch(_setInput(inputConfig, update));
        if (!suppressChange) {
            const state = getState();
            const inputsState = _getInputsStateFromGlobal(inputConfig, state);
            _fireChanges(inputConfig, update, inputsState, state, dispatch);
        }
        return Promise.resolve(update);
    };
}

export function resetInputs(inputConfig, inputKeys) {
    const update = getDefaultInputs(inputConfig);
    return setInput(inputConfig, inputKeys ? _pick(update, inputKeys) : update);
}

/**
 * Validates the current state of inputs corresponding to the given keys
 *
 * @param inputConfig
 * @param inputKeys {Array}
 * @returns {Thunk}
 */
export function validateInputs(inputConfig, inputKeys, suppressChange) {
    return (dispatch, getState) => {
        const inputsState = _getInputsStateFromGlobal(inputConfig, getState());
        const keys = inputKeys || _keys(inputsState);
        const inputsToValidate = _reduce(keys, (result, key) => {
            if (key === FORM_KEY) {
                return result;
            }
            const input = inputsState[key];
            if (inputConfig[key] && input) {
                result[key] = typeof input.error !== 'undefined' ? input.error : input.value;
            }
            return result;
        }, {});
        return updateAndValidate(inputConfig, inputsToValidate, suppressChange)(dispatch, getState);
    };
}

export function updateAndValidate(inputConfig, update, suppressChange) {
    return (dispatch, getState) => {
        const inputs = _filterUnknownInputs(inputConfig, update);

        if (_isEmpty(inputs)) {
            return Promise.resolve();
        }

        const state = getState();
        const inputsState = _getInputsStateFromGlobal(inputConfig, state);
        const promises = [];
        let anyAsync = false;

        const changes = _reduce(inputs, (result, value, key) => {
            const { validator } = inputConfig[key];

            const validationResult = validator ? validator(value, inputsState, state, dispatch) : true,
                prev = inputsState[key] && inputsState[key].value,
                unchanged = _isEqual(prev, value),
                hasAsync = typeof validationResult === 'object' && !!validationResult.then;

            const dispatchAndReturnPromiseResult = inputState =>
                setInput(inputConfig, { [key]: inputState }, suppressChange)(dispatch, getState);

            if (typeof validationResult === 'boolean' || typeof validationResult === 'string' || hasAsync) { // Or Promise
                const change = (validationResult === true || hasAsync) ? ({ // True or hasAsync, set value
                    value: value,
                    validating: hasAsync && !unchanged // Will be validating if async validator exists
                }) : ({ // False returned, input invalid
                    value: prev,
                    error: value || '',
                    validating: false
                });


                // Add errorText if validator returned a string
                if (typeof validationResult === 'string') {
                    change.errorText = validationResult;
                }

                result[key] = change;

                if (!hasAsync || unchanged) {
                    promises.push(Promise.resolve({ [key]: change }));
                } else {
                    anyAsync = true;
                    // Kick off async
                    promises.push(validationResult.then(
                        // Passed validation
                        () => dispatchAndReturnPromiseResult({ value }),
                        // Failed validation
                        errorText => dispatchAndReturnPromiseResult({
                            value: prev,
                            error: value || '',
                            errorText
                        })
                    ));
                }
            } else {
                log.error(`
                Value returned from validator must be a 
                boolean representing valid/invalid, a string representing errorText, or a promise for performing async 
                validation. Got ${typeof validationResult} instead.
            `);
            }

            return result;
        }, {});

        if (anyAsync) {
            dispatch(validating(inputConfig, true));
        }
        setInput(inputConfig, changes, suppressChange)(dispatch, getState);

        return new Promise((resolve, reject) => {
            Promise.all(promises).then(results => {
                const resultObject = _assign({}, ...results);

                if (anyAsync) {
                    dispatch(validating(inputConfig, false));
                }
                const erroredInputs = _haveErrors(resultObject);
                if (erroredInputs) {
                    reject(erroredInputs);
                } else {
                    resolve(resultObject);
                }
            });
        });
    };
}

export function initializeInputs(inputconfig, update) {
    return updateAndValidate(inputconfig, update, true);
}
