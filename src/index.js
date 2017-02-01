/**
redux-inputs

 Requirements:
    packages: redux, redux-thunk
    Apply redux-thunk to store
 */

/**
 * Action Types
 * SET_INPUT - Called after input(s) are validated and set.
 * LOADING - Called when async starts/finishes with `force` boolean.
 */
export { SET_INPUT } from './actions/actionTypes.js';

/**
 * Reducer creator
 */
export { createInputsReducer } from './reducers';

/**
 * Action creators and thunks
 */
export {
    setInputs,
    validateInputs,
    updateAndValidate,
    setValues,
    setErrors,
    initializeInputs,
    resetInputs
} from './actions';

export {
    inputsSelector,
    valuesSelector,
    validatingSelector,
    pristineSelector,
    validSelector
} from './util/selectors';

/**
 * Utility functions
 */
export { default as connectWithInputs } from './util/connectWithInputs';
export { default as getInputProps } from './util/getInputProps';
export { getInputsFromState, getReduxMountPoint } from './util/helpers';
export { default as ReduxInputsWrapper } from './util/ReduxInputsWrapper';
