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
        const { id, label, error, errorText } = this.props;
        let errorComponent;
        let labelComponent;

        // Only have a label if label text is given
        if (label) {
            labelComponent = <label style={{display: 'block'}} htmlFor={id}>{label}</label>;
        }

        if (error && errorText) {
            errorComponent = <p style={{color: 'red'}}>{errorText}</p>;
        }

        return (
            <div>
                {labelComponent}
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
    pristine: React.PropTypes.bool,
    validating: React.PropTypes.bool,
    errorText: React.PropTypes.node,
    children: React.PropTypes.any
};
// Helper function for using Wrapper as a higher-order component
export const wrap = (WrappedComponent, { fieldProps = {} } = {}) => React.createClass({
    displayName: `Field(${getDisplayName(WrappedComponent)})`,
    render() {
        const childProps = omit(this.props, ['label', 'error', 'errorText', 'pristine', 'validating']);
        return (
            <Field {...this.props} {...fieldProps}>
                <WrappedComponent {...childProps}/>
            </Field>
        );
    }
});

/**
 * BlurInput sends onChange events to its parent on blur.
 */
class BlurInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ value: nextProps.value });
    }
    handleChange(e) {
        this.setState({ value: e.target.value });

        if (typeof this.props.debounceMs !== 'undefined') {
            this.deb = this.deb || _debounce(this.props.onChange, this.props.debounceMs);
            this.deb(_clone(e));
        }
        e.stopPropagation();
    }
    handleBlur(e) {
        if (this.props.value !== this.state.value) {
            this.props.onChange(e);
        }
        if (this.props.onBlur) {
            this.props.onBlur(e);
        }
    }
    handleKeyPress(e) {
        if (e.key === 'Enter' && !this.props.textarea) {
            if (this.props.onBlur) {
                this.props.onBlur(e);
            }
            e.target.blur();
        }
        if (this.props.onKeyPress) {
            this.props.onKeyPress(e);
        }
    }
    render() {
        const { textarea, ...otherProps } = this.props;

        const props = {
            ...otherProps,
            value: this.state.value || '',
            onKeyPress: this.handleKeyPress,
            onChange: this.handleChange,
            onBlur: this.handleBlur
        };

        if (textarea) {
            return <textarea {...props}/>;
        }

        return <input type="text" {...props}/>;
    }
}

const InputComponent = ({id, value, type = 'text', ...otherProps}) => (
    <input type={type} name={id} value={value || ''} {...otherProps}/>
);
const InputField = wrap(BlurInput);
export const Input = ReduxInputsWrapper(InputField, {
    onChangeTransform: (e) => e.target.value
});
