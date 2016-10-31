import { connect as _connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { inputsSelector, formSelector } from './selectors';
import getInputProps from './getInputProps';
import { bindActions } from '../actions';

function applyMapDispatchToProps(mapDispatchToProps, dispatch, ownProps) {
    if (typeof mapDispatchToProps === 'function') {
        return mapDispatchToProps(dispatch, ownProps);
    } else {
        return bindActionCreators(mapDispatchToProps, dispatch);
    }
}

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
export default (
    inputConfig,
    mapReduxInputsToProps = reduxInputs => ({ reduxInputs }),
    connect = _connect
) => {
    const inputActions = bindActions(inputConfig);

    return (
        mapStateToProps = i => i,
        mapDispatchToProps = dispatch => ({ dispatch }),
        mergeProps = (stateProps, dispatchProps, ownProps) => ({ ...stateProps, ...dispatchProps, ...ownProps }),
        connectOptions = {}
    ) => Component => connect(
        (state, ownProps) => ({
            _reduxInputsState: inputsSelector(inputConfig)(state), // Temporary prop to pass down to merge
            _reduxInputsForm: formSelector(inputConfig)(state),
            ...mapStateToProps(state, ownProps)
        }),
        (dispatch, ownProps) => ({
            _getInputProps: inputs => getInputProps(inputConfig, inputs, dispatch), // Temporary
            _reduxInputsActions: bindActionCreators(inputActions, dispatch),
            ...applyMapDispatchToProps(mapDispatchToProps, dispatch, ownProps)
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
