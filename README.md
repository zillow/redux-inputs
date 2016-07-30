# redux-inputs
[![npm version](https://badge.fury.io/js/redux-inputs.svg)](https://badge.fury.io/js/redux-inputs)

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

To set up redux-inputs, there are three steps:

### Step 1

Add [redux-thunk](https://github.com/gaearon/redux-thunk) middleware to your store,
 following instructions at that repo.

### Step 2

Create an input configuration object and add a redux-inputs reducer to your redux
 store in your project's reducers file.

    import { combineReducers } from 'redux';
    import { createInputsReducer } from 'redux-inputs';

    const inputConfig = { email: {} };
    const reducer = combineReducers({
        inputs: createInputsReducer(inputConfig)
    });

Note that `inputs` is the default mount point for redux-inputs state. You can
 configure this in your `inputConfig` object.

    inputConfig = {
        _form: {
            reduxMountPoint: 'loginModal.userInputs'
        }
        ... other inputs config ...
    }

In this example your state would look like this:

    {
        loginModal: {
            userInputs: { ... }
        }
    }

### Step 3 - Provide props to input components

The standard state format for an input in redux looks like this:

    inputs: {
        email: {
            value: 'test@test.com',
            error: '244535'
        }
    }

This represents a form with one input where the user first typed 'test@test.com',
 but changed it to '244535', which is invalid. This state is what you get when you
 use redux connect into your component.

In your connected component, use the `getInputProps` function to get an object with
 the following shape:
    {
        value: The last valid state the input had.
        error: The state of the input if invalid, undefined otherwise. Should be displayed as value if present.
        dispatchChange: A function to call on input changes to update the store
    }

The following example uses React, though it is not strictly required.

    import { connect } from 'react-redux';

    function Form(props) {
        const { dispatch, inputs } = props;
        const formInputs = getInputProps(inputConfig, inputs, dispatch);
        const isError = formInputs.error !== undefined;
        const value = isError ? formInputs.value : formInputs.error;
        return (
            <form className={isError ? 'error' : ''}>
                <input id="email"
                       value={formInputs.value}
                       onChange={(e) => {
                           dispatchChange({ email: { value: e.target.value } })
                       }} />
            </form>
        )
    }
    const FormContainer = connect(state => state)(Form);

The object passed to dispatchChange can have any number of key-value pairs in it.

`dispatchChange` also returns a promise for when async validation runs and you want to handle the result after it's done.

With this set up, you are able make changes to inputs and have them declaratively
 validated and state synchronized with your store. Because this could send actions
 to your store every keystroke, you probably want to use something like a
 [BlurInput](http://khan.github.io/react-components/#blur-input).

By keeping these two redux-inputs functions flexible, it is easy to have multiple
 forms by making multiple inputConfigs. You can also make dynamic forms by
 dynamically creating input configs, replacing reducers, and creating dynamic components.

## Components in React
### `ReduxInputsWrapper`
To facilitate using redux-inputs with React, a higher order component `ReduxInputsWrapper`
 is provided that adds additional props to the wrapped component:

 - `parser`: Function to turn a value from a 'change' event into a logical value to be stored
 - `formatter`: Function to create a DOM-appropriate string from a value
 - `resolve`: Function that will be called after value changes have been set in the store
 - `reject`: Function that will be called if value changes fail validation

#### Arguments
- `WrappedComponent` *(Component)*
- `options` *(Object)*
- - `onChangeTransform` *(Function)* [optional] Turn a browser change event into a value. (e.g. e => e.target.value for `input`)


## Other Actions Creators

### `setInputs(inputConfig, change)`

Creates an action that sets inputs state directly without validation.

#### Arguments
- `inputConfig` *(Object)*
- `change` *(Object)*

Example change:

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

A thunk that returns a Promise which resolves if all inputs are valid, rejects if one or more inputs are invalid.
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
