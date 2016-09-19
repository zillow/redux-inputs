# Input Config object

## Example

    const inputConfig = {
        email: {
            defaultValue: '',
            validator: (value) => typeof value === 'string' && value.length > 0
        }
    };

This inputConfig defines a single email input with a defaultValue, validator, and asyncValidator.

## API

### `defaultValue` *(Any)* The value your input will start out with. 

### `validator(value, inputsState, state, dispatch)`
 
Function for performing validation
 
#### Passed arguments
1. `value` *(Any)* The value of the input being validated
2. `inputsState` *(Object)* The current state of your inputs
3. `state` *(Object)* The state of the entire redux store
4. `dispatch` *(Function)* dispatch function from the redux store, for dispatching side-effect actions

#### Must return one of the following:
- *(Boolean)*: true for valid, false for invalid.
- *(String)*: indicates an error and becomes errorText, which is added to the input state
- *(Promise)*: a promise for performing async validation. Resolves if valid, rejects if invalid
    - `resolve` *(Function)*
    - `reject` *(Function)*
        - Optionally, reject can be passed *(String)* `errorText`, which is added to the input state.
        
#### Example

    inputConfig: {
        homeValue: {
            validator: value => typeof value === 'number' && value > 0
        },
        downPayment: {
            validator: (value, inputsState) => {
                return typeof value === 'number' &&
                    value > 0 &&
                    value < inputsState.homeValue.value
            }
        },
        zipCode: {
            validator: (value) => {
                // Client-side validation
                if (!value || value.length < 5 || value.length > 5) {
                    return false;
                }
                
                // Async validation
                return new Promise((resolve, reject) => {
                    asyncValidateZIPCode((error) => {
                        if (error) {
                            if (error === 'Unsupported') {
                                reject({
                                    error: value,
                                    errorType: 'Unsupported' // Extra information stored on input state to be used in view
                                });
                            } else {
                                reject(); // Generic error
                            }
                        } else {
                            resolve(); // Validation passed
                        }
                    })
                });
            }
        }
    }

### `onChange(value, inputsState, state, dispatch)`
 
Function for firing actions after an input is validate and changed.

### `props` *(Object)* Props to pass down to every component associated with this input 
 
#### Passed arguments
1. `value` *(Any)* The value of the input being validated
2. `inputsState` *(Object)* The current state of your inputs
3. `state` *(Object)* The state of the entire redux store
4. `dispatch` *(Function)* dispatch function from the redux store, for dispatching side-effect actions

## Form Config

You may set a `_form` property at the root of `inputConfig` to change some form-wide settings

#### `reduxMountPoint` *(String)* change the key used to store redux-inputs state in the store. Defaults to `inputs`. If the input state is stored deeply in the state tree, this `can.be.dot.separated`.

    inputConfig = {
        _form: {
            reduxMountPoint: 'tab1.inputs'
        }
        ... other inputs config ...
    }
    
In this example your state would look like this:

    {
        tab1: {
            inputs: {}
        }
    }
