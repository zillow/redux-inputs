# redux-inputs
[![npm version](https://badge.fury.io/js/redux-inputs.svg)](https://badge.fury.io/js/redux-inputs)
[![Build Status](https://travis-ci.org/zillow/redux-inputs.svg?branch=master)](https://travis-ci.org/zillow/redux-inputs)

`redux-inputs` works with redux to validate and store values from inputs and forms.

## Features

- Declarative validation
- Declarative parsing
- Declarative formatting
- Async validation
- Per-input validation
- Cross-field validation
- Custom input components
- Programatic value collection
- Programatic value initialization
- Progamatic value modification
- Programatic input reset


## Docs

- [Getting Started](docs/gettingStarted.md)
- [API](docs/api.md)
- [Examples](https://zillow.github.io/redux-inputs/examples/)

## Installation

`npm install --save redux-inputs`

## Single File Example

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createInputsReducer, connectWithInputs, ReduxInputsWrapper } from 'redux-inputs';
import { Provider } from 'react-redux';
import thunk = from 'redux-thunk';

// Define configuration for this form. A single input named 'email' with a default value and a function to determine validity.
const inputsConfig = {
    email: {
        defaultValue: 'test@example.com',
        validator: (value) => typeof value === 'string' && value.indexOf('@') >= 0
    }
};

// Create redux store with a reducer created with the createInputsReducer function.
const reducer = combineReducers({
    inputs: createInputsReducer(inputsConfig)
});
const store = createStore(reducer, applyMiddleware(thunk));

// Define our own Field component, and wrap it in a ReduxInputsWrapper to easily create a compatible input component.
// Integration with other ui component libraries, such as material-ui, would be done here.
const Field = ({id, value, error, onChange, errorText}) => (
    <div>
        <input name={id} value={value} onChange={(e) => onChange(e.target.value)}/>
        {error ? <p style={{color: 'red'}}>{errorText}</p> : null}
    </div>
);
const ReduxInputsField = ReduxInputsWrapper(Input);

// Use the newly created ReduxInputsField by spreading in reduxInputs.inputProps.email object.
const Form = ({ inputs, reduxInputs }) => (
    <form>
        <ReduxInputsField errorText="Your email must contain an @" {...reduxInputs.inputProps.email}/>
        <h3>Input state</h3>
        <pre>{JSON.stringify(inputs, null, 2)}</pre>
    </form>
);

// Hook the form up to the store with connectWithInputs, a wrapped version of react-redux's connect.
const FormContainer = connectWithInputs(inputsConfig)(s => s)(Form);
ReactDOM.render(<Provider store={store}><FormContainer /></Provider>, document.getElementById('container'));
```

## Contributing

### Build

    gulp

### Examples

    npm run watch-examples & npm run serve-examples

### Tests

    gulp eslint
    npm test
