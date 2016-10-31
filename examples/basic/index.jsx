import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { createInputsReducer, connectWithInputs, ReduxInputsWrapper } from 'redux-inputs';
import thunk from 'redux-thunk';
import React from 'react';
import ReactDOM from 'react-dom';
import { Input } from '../html-redux-inputs.jsx';

const inputsConfig = {
    email: {
        defaultValue: 'test@example.com',
        validator: (value) => typeof value === 'string' && value.indexOf('@') >= 0
    }
};
const reducer = combineReducers({
    inputs: createInputsReducer(inputsConfig)
});
const store = createStore(reducer, applyMiddleware(thunk));

function Form(props) {
    const { inputs, reduxInputs } = props;
    const { inputProps, values, valid, pristine, validating } = reduxInputs;
    return (
        <form>
            <h1>Basic Example</h1>
            <Input label="Email" errorText="Your email must contain an @" {...inputProps.email}/>

            <h3>reduxInputs props</h3>
            <ul>
                <li>values: <pre>{JSON.stringify(values, null, 2)}</pre></li>
                <li>valid: {valid.toString()}</li>
                <li>pristine: {pristine.toString()}</li>
                <li>validating: {validating.toString()}</li>
            </ul>

            <h3>Input state</h3>
            <pre>{JSON.stringify(inputs, null, 2)}</pre>

        </form>
    );
}
const FormContainer = connectWithInputs(inputsConfig)(s => s)(Form);
ReactDOM.render(<Provider store={store}><FormContainer /></Provider>, document.getElementById('container'));
