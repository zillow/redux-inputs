import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { createInputsReducer, connectWithInputs, ReduxInputsWrapper } from '../..';
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

let EmailInput = ({id, value, error, onChange}) => (
    <div>
        <input name={id} value={value} onChange={(e) => onChange(e.target.value)}/>
        {error ? <p style={{color: 'red'}}>Your email must contain an @</p> : null}
    </div>
);
EmailInput = ReduxInputsWrapper(EmailInput);

function Form(props) {
    const { inputs, inputProps } = props;
    return (
        <form>
            <EmailInput {...inputProps.email}/>
            <h3>Input state</h3>
            <pre>{JSON.stringify(inputs, null, 2)}</pre>
        </form>
    );
}
const FormContainer = connectWithInputs(inputConfig)(s => s)(Form);
ReactDOM.render(<Provider store={store}><FormContainer /></Provider>, document.getElementById('container'));
