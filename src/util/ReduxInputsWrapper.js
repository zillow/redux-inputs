import React from 'react';
import _identity from 'lodash/identity';
import getDisplayName from 'react-display-name';

export const createOnChangeWithTransform = (
    dispatchChange,
    onChange,
    onChangeTransform = _identity,
    parser = _identity,
    onValidationSuccess = _identity,
    onValidationFail = _identity
) => e => {
    const result = dispatchChange(parser(onChangeTransform(e))).then(onValidationSuccess, onValidationFail);
    onChange && onChange(e);
    return result;
};

/**
 * Higher order component that wraps a given input to be compatible with redux-inputs
 *
 * The wrapped component will be given the following props:
 * - _id - An identifier unique to the input consisting of mount point and input id
 * - value - The current displayed value
 * - error - True if current value is invalid
 * - dispatchChange - callback for updating the value
 * - errorText - String to display to the user of current error
 */
const ReduxInputsWrapper = (WrappedComponent, options = {
    onChangeTransform: _identity
}) => {
    const Wrapper = ({
        id,
        _id,
        value,
        parser,
        formatter,
        dispatchChange,
        onChange,
        onValidationSuccess,
        onValidationFail,
        ...otherProps
    }) => {
        const {
            /**
             * transform fn to run on onChange event before passing to redux
             */
            onChangeTransform
        } = options;

        return (
            <WrappedComponent id={id || _id}
                              value={formatter ? formatter(value) : value}
                             // onChange function to take an event facade, dispatch a change event
                              onChange={createOnChangeWithTransform(dispatchChange, onChange, onChangeTransform, parser, onValidationSuccess, onValidationFail)}
                              {...otherProps}/>
        );
    };
    Wrapper.displayName = `ReduxInputsWrapper(${getDisplayName(WrappedComponent)})`;
    Wrapper.propTypes = {
        /**
         * Generated id from getInputProps (mountPoint:key)
         */
        _id: React.PropTypes.string.isRequired,
        /**
         * Optional override id if you don't want to use default _id from inputConfig key
         */
        id: React.PropTypes.string,
        /**
         * The logical value of the input from the redux store
         */
        value: React.PropTypes.any,
        /**
         * Function to create a value from a change event into a value to store
         */
        parser: React.PropTypes.func,
        /**
         * Function to create a DOM-appropriate string from a value
         */
        formatter: React.PropTypes.func,
        /**
         * Private function from getInputProps, returns a promise
         */
        dispatchChange: React.PropTypes.func.isRequired,
        /**
         * Callback for React's native onChange
         */
        onChange: React.PropTypes.func,
        /**
         * Callback after successful validation and update
         */
        onValidationSuccess: React.PropTypes.func,
        /**
         * Callback after failed validation
         */
        onValidationFail: React.PropTypes.func
    };
    return Wrapper;
};

export default ReduxInputsWrapper;
