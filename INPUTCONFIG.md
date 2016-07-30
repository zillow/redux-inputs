# Input Config object

## Example

    let inputConfig = {
        email: {
            defaultValue: '',
            validator: (value) => typeof value === 'string' && value.length > 0,

            // Must return a promise
            // Any errors in the async validation should be handled here
            asyncValidator: (value) => new Promise(resolve) {
                ... async stuff ...

                // Resolve if valid, reject if invalid
                resolve();
            }
        }
    };

This inputConfig defines a single email input with a defaultValue, validator, and asyncValidator.

## API

### `defaultValue` *(Any)* The value your inputs will start out with.

### `validator(value, inputsState, state)`

Function for performing client side validation

#### Arguments
1. `value` *(Any)* The value of the input being validated
2. `inputsState` *(Object)* The current state of your inputs
3. `state` *(Object)* The state of the entire redux store

#### Returns
*(Boolean)*|*(Object)*: If boolean, true for valid, false for invalid. If object, represents the new state of the input.
This can be used to add error information to the input state, such as setting errorText.

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
    }

### `asyncValidator(value, inputsState, state, dispatch)`

Similar to validator, but for doing asynchronous validation. Is only called if client-side validation passes.

#### Arguments
1. `value` *(Any)* The value of the input being validated
2. `inputsState` *(Object)* The current state of your inputs
3. `state` *(Object)* The state of the entire redux store
4. `dispatch` *(Function)* dispatch function from the redux store, for dispatching side-effect actions

#### Returns
- *(Promise)*: Resolves if valid, rejects if invalid.
    - `resolve` *(Function)*
    - `reject` *(Function)*
        - `newInputState` *(Object)* Optionally return the new input state object to set the input to. This is useful for adding error information to the input state.

#### Example

    inputConfig: {
        zipCode: {
            asyncValidator: (value) => new Promise((resolve, reject) => {
                asyncValidateZIPCode((error) => {
                    if (error) {
                        if (error === 'Unsupported') {
                            reject({
                                error: value,
                                errorType: 'Unsupported' // Extra information stored on input state to be used in view
                            });
                        } else {
                            reject();
                        }
                    } else {
                        resolve();
                    }
                })
            })
        }
    }

## Form Config

You may set a `_form` property at the root of `inputConfig` to change some form-wide settings

#### `reduxMountPoint` *(String)* change the key used to store redux-inputs state in the store. Defaults to `inputs`. If the input state is stored deeply in the state tree, this `can.be.dot.separated`.
#### `metaCreator` *(Function)* is passed the action object whenever an action is created. Can be used to add meta information to a dispatched action. This can be useful for integrating with [redux-analytics](https://github.com/markdalgleish/redux-analytics).
