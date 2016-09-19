import _reduce from 'lodash/reduce';
import _isEmpty from 'lodash/isEmpty';
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

function _validate(inputConfig, inputs, state, dispatch) {
    const inputsState = _getInputsStateFromGlobal(inputConfig, state);
    const promises = [];
    let anyAsync = false;

    const changes = _reduce(inputs, (result, value, key) => {
        const { validator } = inputConfig[key];

        const validationResult = validator ? validator(value, inputsState, state, dispatch) : true,
              prev = inputsState[key] && inputsState[key].value,
              hasAsync = typeof validationResult === 'object' && !!validationResult.then;

        const dispatchAndReturnPromiseResult = inputState => {
            dispatch(setInput(inputConfig, { [key]: inputState }));
            return {
                key,
                inputState
            };
        };

        if (typeof validationResult === 'boolean' || typeof validationResult === 'string' || hasAsync) { // Or Promise
            const change = (validationResult === true || hasAsync) ? ({ // True or hasAsync, set value
                value: value,
                validating: hasAsync // Will be validating if async validator exists
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

            if (!hasAsync) {
                promises.push(Promise.resolve({
                    key,
                    inputState: change
                }));
            }
        } else {
            log.error(`
                Value returned from validator must be a 
                boolean representing valid/invalid, or an promise representing ${key}\'s 
                new state. Got ${typeof validationResult} instead.
            `);
        }

        if (hasAsync) {
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

        return result;
    }, {});

    if (anyAsync) {
        dispatch(validating(inputConfig, true));
    }
    dispatch(setInput(inputConfig, changes));

    return new Promise((resolve, reject) => {
        Promise.all(promises).then(results => {
            const resultObject = _reduce(results, (result, { key, inputState }) => {
                result[key] = inputState;
                return result;
            }, {});
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

        // Return promise from validate
        return _validate(inputConfig, inputs, getState(), dispatch);
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
