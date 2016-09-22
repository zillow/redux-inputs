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
    initializeInputs,
    resetInputs
} from './actions';

/**
 * Utility functions
 */
export { getInputProps, connectWithInputs, getInputsFromState, getReduxMountPoint, FORM_KEY } from './util/helpers';
export { default as ReduxInputsWrapper } from './util/ReduxInputsWrapper';
