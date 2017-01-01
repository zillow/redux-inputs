import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { createInputsReducer, connectWithInputs, ReduxInputsWrapper } from 'redux-inputs';
import thunk from 'redux-thunk';
import React from 'react';
import ReactDOM from 'react-dom';
import { Input } from '../html-redux-inputs.jsx';

export const inputsConfig = {
    zipCode: {
        validator: (value) => {
            if (value !== undefined && value.length > 0 && /^\d+$/.test(value)) {
                // Passed client-side validation, now attempt server-side validation
                return new Promise((resolve, reject) => {
                    // Simulate API call
                    setTimeout(resolve, 300 * Math.random());
                });
            }
            return false; // Failed client-side validation
        }
    },
    bedrooms: {
        validator: (v) => {
            // Validators can also return a new input state to provide more information about the error
            if (typeof v === 'undefined' || v === '') {
                return 'Required'; // This will set error text to be the string 'Required'
            } else if (isNaN(Number(v))) {
                return 'Must be a number';
            } else if (Number(v) < 0 || Number(v) > 20) {
                return 'Enter a number between 0 and 20';
            } else {
                return true; // Valid
            }
        }
    },
    phone: {
        validator: (v) => !!v && !isNaN(Number(v))
    }
};

const reducer = combineReducers({
    inputs: createInputsReducer(inputsConfig)
});
const store = createStore(reducer, applyMiddleware(thunk));


function phoneParser(value) {
    return value && value.replace(/[^\d]/g, '');
}

function phoneFormatter(value) {
    if (!value) {
        return value;
    }
    var raw = value.replace(/[^\d]/g, ''),
        parsed;
    if (raw.length === 0) {
        return raw;
    } else if (raw.length < 3) {
        parsed = '(' + raw;
    } else if (raw.length < 6) {
        parsed = '(' + raw.substring(0, 3) + ') ' + raw.substring(3, 6);
    } else {
        parsed = '(' + raw.substring(0, 3) + ') ' + raw.substring(3, 6) +
            ' - ' + raw.substring(6);
    }

    return parsed;
}

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {};
    }
    onSubmit(e) {
        const { validateInputs } = this.props;
        e.preventDefault();
        validateInputs().then(
            ({ zipCode, bedrooms, phone }) => {
                // Make API call (mocked here)
                setTimeout(() => {
                    this.setState({ submitMessage: (`Submitted zip: ${zipCode.value}, bedrooms: ${bedrooms.value}, phone: ${phone.value}.`) })
                }, 100);
            },
            (erroredInputs) => {
                this.setState({ submitMessage: (`Invalid Inputs: ${Object.keys(erroredInputs).join(', ')}.`) });
            }
        );
    }

    render() {
        const { inputProps } = this.props;
        const { zipCode, bedrooms, phone } = inputProps;

        return (
            <div>
                <div>
                    <h1>Submit Example</h1>
                    <p>Use <a href="https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en">redux devtools</a> to view state changes</p>
                    <form onSubmit={this.onSubmit}>
                        <Input label="ZIP Code"
                               placeholder="Enter a ZIP code"
                               errorText="Please enter a valid ZIP code"
                               {...zipCode}
                        />
                        <Input label="Bedrooms"
                               {...bedrooms}
                        />
                        <Input label="Phone Number"
                               parser={phoneParser}
                               formatter={phoneFormatter}
                               {...phone}
                        />
                        <button onClick={this.onSubmit} style={{marginBottom: '1rem'}}>Submit</button>
                    </form>
                    { this.state.submitMessage && <pre>{this.state.submitMessage}</pre> }
                </div>
            </div>
        );
    }
}
Form.propTypes = {
    inputProps: React.PropTypes.object,
    validateInputs: React.PropTypes.func
};

const FormContainer = connectWithInputs(inputsConfig, ({ inputProps, validateInputs }) => ({
    inputProps,
    validateInputs
}))(t => t)(Form);

ReactDOM.render(<Provider store={store}><FormContainer /></Provider>, document.getElementById('container'));
