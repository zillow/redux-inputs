import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import invariant from 'invariant';
import _mapValues from 'lodash/mapValues';
import _property from 'lodash/property';
import _reduce from 'lodash/reduce';
import _isEmpty from 'lodash/isEmpty';
import _omit from 'lodash/omit';

import { bindActions, updateAndValidate } from '../actions';
import { createInputsSelector, createFormSelector } from './selectors';

export const FORM_KEY = '_form';
export const DEFAULT_REDUX_MOUNT_POINT = 'inputs';

export function getReduxMountPoint(inputConfig) {
    const formConfig = inputConfig[FORM_KEY];
    return (formConfig && formConfig.reduxMountPoint) || DEFAULT_REDUX_MOUNT_POINT;
}

export function getInputsFromState(inputConfig, state) {
    const mountPoint = getReduxMountPoint(inputConfig);

    const inputsState = _property(mountPoint)(state);
    invariant(inputsState, `[redux-inputs]: no state found at '${mountPoint}', check your reducers to make sure it exists or change reduxMountPoint in your inputConfig.`);
    return inputsState;
}

export function inputsWithErrors(inputs) {
    const erroredInputs = _reduce(inputs, (result, input, key) => {
        if (typeof input.error !== 'undefined') {
            result[key] = input;
        }
        return result;
    }, {});

    return _isEmpty(erroredInputs) ? false : erroredInputs;
}

/**
 * Helper function for providing props to redux-input controlled components
 * @param inputConfig
 * @param state - redux-inputs form state
 * @param dispatcher
 */
export const getInputProps = (inputConfig, inputsState, dispatch) => (
    _mapValues(_omit(inputConfig, FORM_KEY), (config, id) => {
        const inputState = inputsState[id];
        invariant(inputState, `[redux-inputs]: ${id} not found in state. Make sure to configure your redux-input reducer.`);

        const { value, error, ...otherState } = inputState;
        const hasError = typeof error !== 'undefined';

        return {
            _id: [getReduxMountPoint(inputConfig), id].join(':'),
            value: hasError ? error : value,
            error: hasError,

            // Prebound change callback
            dispatchChange: newVal => dispatch(updateAndValidate(inputConfig, {
                [id]: newVal
            })),

            // Props from config
            ...config.props,

            // Other properties in inputState passed down as props (e.g. errorText)
            ...otherState
        };
    })
);

/**
 * Creates a function that works like react-redux `connect`, but adds a prop: *`inputProps`*
 * which contains the props for each input specified in the inputConfig.
 * This is generated with redux-inputs's `getInputProps` function.
 *
 * @param inputConfig {Object}
 * @param options
 *      options.inputPropsKey {String}
 *      options.inputActionsKey {String}
 * @returns `connect` function
 */
export const connectWithInputs = (inputConfig, options = {}) => {
    const opts = {
        // Defaults
        inputPropsKey: 'inputProps',
        inputActionsKey: 'inputActions',
        formKey: 'form',
        connect: connect,
        ...options
    };
    const inputsSelector = createInputsSelector(inputConfig);
    const formSelector = createFormSelector(inputConfig);
    const inputActions = bindActions(inputConfig);

    return (
        mapStateToProps = i => i,
        mapDispatchToProps = dispatch => ({ dispatch }),
        mergeProps = (stateProps, dispatchProps, ownProps) => ({ ...stateProps, ...dispatchProps, ...ownProps }),
        connectOptions = {}
    ) => Component => opts.connect(
        (state, ownProps) => ({
            _inputs: inputsSelector(state), // Temporary prop to pass down to merge
            [opts.formKey]: formSelector(state),
            ...mapStateToProps(state, ownProps)
        }),
        (dispatch, ownProps) => ({
            _getInputProps: inputs => getInputProps(inputConfig, inputs, dispatch), // Temporary
            [opts.inputActionsKey]: bindActionCreators(inputActions, dispatch),
            ...mapDispatchToProps(dispatch, ownProps)
        }),
        ({ _inputs, ...stateProps}, { _getInputProps, ...dispatchProps }, ownProps) => ({
            [opts.inputPropsKey]: _getInputProps(_inputs), // Use temporary props to create inputProps
            ...mergeProps(stateProps, dispatchProps, ownProps)
        }),
        connectOptions
    )(Component);
};

