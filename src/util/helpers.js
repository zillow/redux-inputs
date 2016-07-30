import invariant from 'invariant';
import _mapValues from 'lodash/mapValues';
import _omit from 'lodash/omit';
import { createInputsThunk } from '../actions';

export const FORM_KEY = '_form';
export const DEFAULT_REDUX_MOUNT_POINT = 'inputs';
const identity = x => x;

export function getReduxMountPoint(inputConfig) {
    const formConfig = inputConfig[FORM_KEY];
    return (formConfig && formConfig.reduxMountPoint) || DEFAULT_REDUX_MOUNT_POINT;
}

export function getMetaCreator(inputConfig) {
    const formConfig = inputConfig[FORM_KEY];
    return (formConfig && formConfig.metaCreator);
}

// Takes the state of inputs from redux and turns it into an object of input key -> value pairs,
// excluding the _form property
export function mapInputValues(inputs, iteratee = i => i.value) {
    return _mapValues(_omit(inputs, FORM_KEY), iteratee);
}

/**
 * Helper function for providing props to redux-input controlled components
 * @param inputConfig
 * @param state - redux-inputs form state
 * @param dispatcher
 */
export function getInputProps(inputConfig, inputsState, dispatch) {
    const onChange = createInputsThunk(inputConfig);

    return _mapValues(_omit(inputConfig, FORM_KEY), (config, id) => {
        const inputState = inputsState[id];
        invariant(inputState, `[redux-inputs]: ${id} not found in state. Make sure to configure your redux-input reducer.`);

        const { value, error, errorText } = inputState;
        const props = config.props || {};
        const hasError = typeof error !== 'undefined';

        if (errorText) {
            props.errorText = errorText;
        }

        return {
            _id: id,
            value: hasError ? error : value,
            error: hasError,
            dispatchChange: (change) => dispatch(onChange(change)),
            ...props
        };
    });
}

/**
 * returns a function that takes a change event from an onChange handler
 * and dispatches an action to update the input
 */
export function createOnChangeWithTransform(
    _id,
    dispatchChange,
    onChangeTransform = identity,
    parser = identity,
    resolve = identity,
    reject = identity
) {
    return (e) => {
        /**
         * Run onChangeTransform to get a value out of a change event
         */
        const val = onChangeTransform(e);
        /**
         * Create a change event for the given id by running the parser on the value
         */
        const change = { [_id]: parser(val) };
        /**
         * Dispatch the change, calling the resolve/reject handlers as appropriate
         */
        return dispatchChange(change).then(resolve).catch(reject);
    };
}
