import React from 'react';
import _identity from 'lodash/identity';
import getDisplayName from 'react-display-name';

export const createOnChangeWithTransform = (
    _id,
    dispatchChange,
    onChangeTransform = _identity,
    parser = _identity
) => e => dispatchChange({
    [_id]: parser(onChangeTransform(e))
});

/**
 * Higher order component that wraps a given input to be compatible with redux-inputs
 *
 * The wrapped component will be given the following props:
 * - id - An identifier
 * - value - The component's last known valid value
 * - onChange - A function to be called when changes occur
 *
 * When used with getInputProps, the following may be passed down
 * - error - When present, the input is in an error state.
 *           This value should be shown instead of the 'value' prop.
 */
const ReduxInputsWrapper = (WrappedComponent, options = {
    onChangeTransform: _identity
}) => {
    const Wrapper = (props) => {
        const {
            id,
            _id,
            value,
            parser,
            formatter,
            dispatchChange,
            ...otherProps
        } = props;

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
                              onChange={createOnChangeWithTransform(_id, dispatchChange, onChangeTransform, parser)}
                              {...otherProps}/>
        );
    };
    Wrapper.displayName = `ReduxInputsWrapper(${getDisplayName(WrappedComponent)})`;
    return Wrapper;
};
ReduxInputsWrapper.propTypes = {
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
     * Private id - from getInputProps, returns a promise
     */
    dispatchChange: React.PropTypes.func.isRequired
};

export default ReduxInputsWrapper;
