import React from 'react';
import getDisplayName from 'react-display-name';
import omit from 'lodash/omit';
import { ReduxInputsWrapper } from 'redux-inputs';
/**
 * Example implementation of a redux-inputs compatible set of input components.
 *
 * You'll most likely have your own set of components (material-ui, react-bootstrap, internal style guide)
 * that you should use instead.
 **/
class Field extends React.Component {
    render() {
        let errorComponent;
        let labelComponent;
        const { id, label, error, errorText } = this.props;

        // Only have a label if label text is given
        if (label) {
            labelComponent = <label style={{display: 'inline-block'}} htmlFor={id}>{label}</label>;
        }

        if (error && errorText) {
            errorComponent = <p style={{color: 'red'}}>{errorText}</p>;
        }

        return (
            <div>
                {label}
                {this.props.children}
                {errorComponent}
            </div>
        );
    }
}
Field.propTypes = {
    id: React.PropTypes.string,
    label: React.PropTypes.node,
    error: React.PropTypes.bool,
    errorText: React.PropTypes.node,
    children: React.PropTypes.any
};
// Helper function for using Wrapper as a higher-order component
export const wrap = (WrappedComponent, { fieldProps = {} } = {}) => React.createClass({
    displayName: `Field(${getDisplayName(WrappedComponent)})`,
    render() {
        const childProps = omit(this.props, ['label', 'error', 'errorText']);
        return (
            <Field {...this.props} {...fieldProps}>
                <WrappedComponent {...childProps}/>
            </Field>
        );
    }
});

const InputComponent = ({id, value, type = 'text', ...otherProps}) => (
    <input type={type} name={id} value={value || ''} {...otherProps}/>
);
const InputField = wrap(InputComponent);
export const Input = ReduxInputsWrapper(InputField, {
    onChangeTransform: (e) => e.target.value
});
