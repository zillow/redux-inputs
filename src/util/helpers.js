import connect from 'react-redux';
import invariant from 'invariant';
import _mapValues from 'lodash/mapValues';
import _omit from 'lodash/omit';

import { updateAndValidate } from '../actions';

export const FORM_KEY = '_form';
export const DEFAULT_REDUX_MOUNT_POINT = 'inputs';
const identity = x => x;

export function getReduxMountPoint(inputConfig) {
    const formConfig = inputConfig[FORM_KEY];
    return (formConfig && formConfig.reduxMountPoint) || DEFAULT_REDUX_MOUNT_POINT;
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
export const getInputProps = (inputConfig, inputsState, dispatch) => (
    mapInputValues(inputConfig, (config, id) => {
        const inputState = inputsState[id];
        invariant(inputState, `[redux-inputs]: ${id} not found in state. Make sure to configure your redux-input reducer.`);

        const { value, error, ...otherState } = inputState;
        const hasError = typeof error !== 'undefined';

        return {
            _id: [getReduxMountPoint(inputConfig), id].join(':'),
            value: hasError ? error : value,
            error: hasError,

            // Prebound change callback
            dispatchChange: update => dispatch(updateAndValidate(inputConfig, update)),

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
    const { inputPropsKey } = {
        // Defaults
        inputPropsKey: 'inputProps',
        inputActionsKey: 'inputActions',
        ...options
    };
    return (
        mapStateToProps = i => i,
        mapDispatchToProps = dispatch => ({ dispatch }),
        mergeProps = (stateProps, dispatchProps, ownProps) => ({ ...stateProps, ...dispatchProps, ...ownProps }),
        options = {}
    ) => Component => connect(
        mapStateToProps,
        (dispatch, ownProps) => ({
            _getInputProps: inputs => getInputProps(inputConfig, inputs, dispatch),
            ...mapDispatchToProps(dispatch, ownProps)
        }),
        (stateProps, { _getInputProps, ...dispatchProps }, ownProps) => ({
            [inputPropsKey]: _getInputProps(
                _property(getReduxMountPoint(inputConfig))(stateProps) // Get inputs state from global state
            ),
            ...mergeProps(stateProps, dispatchProps, ownProps)
        }),
        options
    )(Component);
};

