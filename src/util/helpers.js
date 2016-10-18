import { bindActionCreators } from 'redux';
import { connect as _connect } from 'react-redux';
import invariant from 'invariant';
import _mapValues from 'lodash/mapValues';
import _property from 'lodash/property';
import _reduce from 'lodash/reduce';
import _isEmpty from 'lodash/isEmpty';
import _omit from 'lodash/omit';

import { bindActions, updateAndValidate } from '../actions';
import { createInputsSelector, createFormSelector } from './selectors';

export const REDUX_MOUNT_POINT = '_reduxMountPoint';
export const DEFAULT_REDUX_MOUNT_POINT = 'inputs';

export function getReduxMountPoint(inputConfig) {
    return inputConfig[REDUX_MOUNT_POINT] || DEFAULT_REDUX_MOUNT_POINT;
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
    _mapValues(_omit(inputConfig, REDUX_MOUNT_POINT), (config, id) => {
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
export const connectWithInputs = (
    inputConfig,
    mapReduxInputsToProps = reduxInputs => ({ reduxInputs }),
    connect = _connect
) => {
    const inputsSelector = createInputsSelector(inputConfig);
    const formSelector = createFormSelector(inputConfig);
    const inputActions = bindActions(inputConfig);

    return (
        mapStateToProps = i => i,
        mapDispatchToProps = dispatch => ({ dispatch }),
        mergeProps = (stateProps, dispatchProps, ownProps) => ({ ...stateProps, ...dispatchProps, ...ownProps }),
        connectOptions = {}
    ) => Component => connect(
        (state, ownProps) => ({
            _reduxInputsState: inputsSelector(state), // Temporary prop to pass down to merge
            _reduxInputsForm: formSelector(state),
            ...mapStateToProps(state, ownProps)
        }),
        (dispatch, ownProps) => ({
            _getInputProps: inputs => getInputProps(inputConfig, inputs, dispatch), // Temporary
            _reduxInputsActions: bindActionCreators(inputActions, dispatch),
            ...mapDispatchToProps(dispatch, ownProps) // TODO support object shorthand
        }),
        (
            { _reduxInputsState, _reduxInputsForm, ...stateProps}, // stateProps
            { _getInputProps, _reduxInputsActions, ...dispatchProps }, // dispatchProps
            ownProps
        ) => ({
            ...mapReduxInputsToProps({
                ..._reduxInputsForm, // values, validating, pristine
                ..._reduxInputsActions, // setInputs, updateAndValidate, validateInputs, resetInputs, initializeInputs
                inputProps: _getInputProps(_reduxInputsState) // Use temporary props to create inputProps
            }),
            ...mergeProps(stateProps, dispatchProps, ownProps)
        }),
        connectOptions
    )(Component);
};

