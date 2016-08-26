import { createStore, combineReducers, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import { createInputsReducer, getInputProps } from '../..';
import thunk from 'redux-thunk';
import React from 'react';
import ReactDOM from 'react-dom';

const inputConfig = {
    email: {
        defaultValue: 'test@example.com',
        validator: (value) => typeof value === 'string' && value.indexOf('@') >= 0
    }
};
const reducer = combineReducers({
    inputs: createInputsReducer(inputConfig)
});
const store = createStore(reducer, applyMiddleware(thunk));

function Form(props) {
    const { dispatch, inputs } = props;
    const inputProps = getInputProps(inputConfig, inputs, dispatch);
    const isEmailError = inputs.email.error;
    return (
        <form>
            <input id="email"
                   value={inputProps.email.value}
                   onChange={(e) => {
                       inputProps.email.dispatchChange({ email: e.target.value })
                   }} />
               { isEmailError? <p style={{color: 'red'}}>Your email must contain an @</p> : null}
            <h3>Input state</h3>
            <pre>{JSON.stringify(inputs, null, 2)}</pre>
        </form>
    );
}
const FormContainer = connect(s => s)(Form);
ReactDOM.render(<Provider store={store}><FormContainer /></Provider>, document.getElementById('container'));
