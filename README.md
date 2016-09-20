# redux-inputs
[![npm version](https://badge.fury.io/js/redux-inputs.svg)](https://badge.fury.io/js/redux-inputs)
[![Build Status](https://travis-ci.org/zillow/redux-inputs.svg?branch=master)](https://travis-ci.org/zillow/redux-inputs)

`redux-inputs` works with redux to validate and store values from inputs and forms.
It primarily consists of a redux reducer creator function and function to get
 a set of properties to be used by input components.
Both the reducer and input props creator take a inputConfig object that defines how inputs
 are initialized and validated.

### Example

    const inputConfig = {
        homePrice: {
            defaultValue: 300000,
            validator: (value) => value > 0 && value < 350000000
        }
    }

[*View the `inputConfig` API here*](INPUTCONFIG.md)

## Installation

`npm install --save redux-inputs`

## Getting Started

### Step 1 - Prerequisites

Add [redux-thunk](https://github.com/gaearon/redux-thunk) middleware to your store,
 following instructions at that repo.

### Step 2 - Config

Create an input configuration object and add a redux-inputs reducer to your redux store in your project's reducers file.

[*View the `inputConfig` properties here*](INPUTCONFIG.md)

Create your inputsConfig object

    const inputsConfig = {
        email: {
            validator: (input) => input && input.length > 3
        }
    };
    
    
### Step 3 - Reducer

Give redux-inputs reducer to Redux in your project's reducers file.

    import { combineReducers } from 'redux';
    import { createInputsReducer } from 'redux-inputs';

    const inputConfig = { email: {} };
    const reducer = combineReducers({
        inputs: createInputsReducer(inputConfig)
    });

### Step 4 - Connect

    import { connectWithInputs } from 'redux-inputs';
    
    YourForm = connectWithInputs(inputConfig)()(YourForm);
    
Connect your form with `connectWithInputs`, which takes the `inputConfig` and creates a function that has the same 
interface as react-redux's `connect`. This will pass down additional props to your component including `inputProps`.

### Step 5 - Wrapper

import { InputsWrapper } from 'redux-inputs';
 
Higher order component that wraps input components and wires them up to the state. This allows all types of inputs to 
conform to the same API, and be easily understood and swapped out.

#### Arguments
- `WrappedComponent` *(Component)*
- `options` *(Object)*
- - `onChangeTransform` *(Function)* [optional] Turn a browser change event into a value. (e.g. `e => e.target.value` for `input`)

#### Props that must be implemented in wrapped component

- id *(string)*: unique id for this input, can be used to link label and input
- value: represents the current value as defined by the input's state
- error *(boolean)*: True if the current value is invalid
- errorText *(string)*
- onChange *(function)*: Takes one parameter - the new value

#### Props added to composed component

- parser *(function)*
- formatter *(function)*
- errorFormatter ?


    let Input = ({id, value, error, onChange}) => (
        <div>
            <input name={id} onChange={(e) => onChange(e.target.value)}/>
            {error ? <div>Invalid input</div> : null} 
        </div>
    );
    Input = InputsWrapper(Input);
    
The `InputsWrapper` looks at the state and turns it into `value`, and `error` props, where `value` is equal to 
`inputs.email.value` if `inputs.email.error` is undefined, or `inputs.email.error` otherwise. The `InputsWrapper` 
passes down any other properties of the input state untouched.
Then this input can be used in the render of connected `YourForm` like this:
    
    render() {
        const { email } = this.props.inputProps;
        
        return (
            <Input {...email}/>
        );
    }
    
Changes from this input will be validated and dispatched, then passed back through component update.

## Form state

 - formValidating *(boolean)*
 - formPristine *(boolean)*
 - formHasError *(boolean)*

## Redux state shape

The standard state format for an input in redux looks like this:

    inputs: {
        email: {
            value: 'test@test.com',
            error: '244535'
        }
    }

This represents a form with one input where the user first typed 'test@test.com',
 but changed it to '244535', which is invalid. This state is what you get when you
 use redux connect into your component, it is called the `inputState` and can be described as:
 
     {
         value: The last valid state the input had.
         error: The state of the input if invalid, undefined otherwise. Should be displayed as value if present.
     }
     
## Single File Example
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createInputsReducer, connectWithInputs } from 'redux-inputs';
import { Provider } from 'react-redux';
import thunk = from 'redux-thunk';

const inputConfig = {
    email: {
        defaultValue: 'test@example.com',
        validator: (value) => typeof value === 'string' && value.indexOf('@') >= 0
    }
};
// If you have multiple inputConfigs, they share this one reducer
const reducer = combineReducers({
    inputs: createInputsReducer(inputConfig)
});
const store = createStore(reducer, applyMiddleware(thunk));

let EmailInput = ({id, value, error, onChange}) => (
    <div>
        <input name={id} onChange={(e) => onChange(e.target.value)}/>
        {error ? <div>Your email must contain an @</div> : null} 
    </div>
);
EmailInput = InputsWrapper(EmailInput);

function Form(props) {
    const { dispatch, inputs, inputProps } = props;
    return (
        <form>
            <EmailInput {...inputProps.email}/>
            <h3>Input state</h3>
            <pre>{JSON.stringify(inputs, null, 2)}</pre>      
        </form>
    )
}
const ConnectedForm = connectWithInputs({
    mountPoint: 'inputs'
    inputConfig
})(s => s)(Form);
ReactDOM.render(<Provider store={store}><ConnectedForm /></Provider>, document.getElementById('container'));
```


[Interactive Demo](./examples.html)

With this set up, you are able make changes to inputs and have them declaratively
 validated and state synchronized with your store. Because this could send actions
 to your store every keystroke, you probably want to use something like a
 [BlurInput](http://khan.github.io/react-components/#blur-input).

## Action Creators/Thunks
 
### `updateInputs(inputConfig, change)`

Thunk that validates change and dispatches `setInputs` to update inputs changed. Returns a Promise where the 
resolve function is passed the input states of inputs that were validated and the 
reject function is passed the input states of inputs that are invalid

#### Arguments
- `inputConfig` *(Object)*
- `change` *(Object)* key-value pairs of input key and new value to be validated and set if valid.

Example change

    {
        email: 'test@test.com',
        name: 'larry'
    }

### `setInputs(inputConfig, newInputState)`

Creates an action that sets inputs state directly without validation.

#### Arguments
- `inputConfig` *(Object)*
- `newInputState` *(Object)*

Example newInputState:

    {
        email: {
            value: 'test@test.com'
            error: '1234'
        },
        name: {
            value: 'larry'
        }
    }

### `validateInputs(inputConfig, ?inputKeys)`

Thunk that returns a Promise which resolves if all inputs are valid, rejects if one or more inputs are invalid.
Triggers errors on inputs.
resolve function is passed the input states of inputs that were validated
reject function is passed the input states of inputs that are invalid

#### Arguments
- `inputConfig` *(Object)*
- `inputKeys` *(Array)* [optional] Array of input keys found in inputConfig. If no inputKeys are given, validates all inputs found in inputConfig.

### `resetInputs(inputConfig)`

Returns an action that when dispatched will reset the form values associated with the given inputConfig to their default values.

## Contributing

### Build

    gulp

### Tests

    npm test


TODO: document exported action types
TODO: calls during async validating?
TODO: validating state
TODO: pristine
