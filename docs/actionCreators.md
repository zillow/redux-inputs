## Action Creators/Thunks

It is recommended you use the action creators from `inputActions` in props passed down from `connectWithInputs`, since 
they are pre-bound to the inputsConfig and dispatch. The unbound versions can be imported for calling 
actions outside of connected components. 

### `updateAndValidate(inputsConfig, change, meta)`

Thunk that validates change and dispatches `setInputs` to update inputs changed. Returns a Promise where the 
resolve function is passed the input states of inputs that were validated and the 
reject function is passed the input states of inputs that are invalid

#### Arguments
- `inputsConfig` *(Object)*
- `change` *(Object)* key-value pairs of input key and new value to be validated and set if valid.
- `meta` *(Object)* [optional] extra meta information to add to the action object(s)

Example change

    {
        email: 'test@test.com',
        name: 'larry'
    }
    
### `initializeInputs(inputsConfig, change, meta)`

Same as updateAndValidate, but all inputs are still considered `pristine` after updating.

### `setInputs(inputsConfig, newInput, meta)`

Creates an action that sets inputs state directly without validation.

#### Arguments
- `inputsConfig` *(Object)*
- `newInput` *(Object)*
- `meta` *(Object)* [optional] extra meta information to add to the action object(s)

Example newInput:

    {
        email: {
            value: 'test@test.com'
            error: '1234'
        },
        name: {
            value: 'larry'
        }
    }

### `setValues(inputsConfig, newValues, meta)`

Thunk that dispatches `setInputs` with new value properties only.

#### Arguments
- `inputsConfig` *(Object)*
- `newValues` *(Object)* key-value pairs of input key and new value to be set.
- `meta` *(Object)* [optional] extra meta information to add to the action object(s)

### `setErrors(inputsConfig, inputKeys, meta)`

Sets the error property for the given inputs.

#### Arguments
- `inputsConfig` *(Object)*
- `inputKeys` *(Array)* Array of input keys found in inputsConfig.
- `meta` *(Object)* [optional] extra meta information to add to the action object(s)

### `validateInputs(inputsConfig, inputKeys, meta)`

Thunk that returns a Promise which resolves if all inputs are valid, rejects if one or more inputs are invalid.
Triggers errors on inputs.
resolve function is passed the input states of inputs that were validated
reject function is passed the input states of inputs that are invalid

#### Arguments
- `inputsConfig` *(Object)*
- `inputKeys` *(Array)* [optional] Array of input keys found in inputsConfig. If no inputKeys are given, validates all inputs found in inputsConfig.
- `meta` *(Object)* [optional] extra meta information to add to the action object(s)

### `resetInputs(inputsConfig, inputKeys, meta)`

Returns an action that when dispatched will reset the form values associated with the given inputsConfig to their `defaultValue` and are considered `pristine`.

#### Arguments
- `inputsConfig` *(Object)*
- `inputKeys` *(Array)* [optional] Array of input keys found in inputsConfig. If no inputKeys are given, resets all inputs found in inputsConfig.
- `meta` *(Object)* [optional] extra meta information to add to the action object(s)

### Note on `meta` parameter - There are some special properties available:
 - `reduxMountPoint` - automatically added to every action fired, specifying which form it is associated with 
 - `suppressChange` - adding this to the meta object for any action creator will skip any `onChange` callbacks in the inputsConfig
 - `forceAsyncValidation` - adding this to the meta object for `validateInputs` and `updateAndValidate` will force async validation even if the value is unchanged
 - `validate` - included when running `validateInputs`
 - `initialize` - included when running `intializeInputs`, sets all changed inputs to `pristine`
 - `reset` - included when running `resetInputs`
