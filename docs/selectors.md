## Selectors

#### Shared arguments
- inputsConfigOrMountPoint {Object|String} - either the string describing the reduxMountPoint, or the inputsConfig.
- inputKeys {Array} - list of keys to run the selection on 

### inputsSelector(inputsConfigOrMountPoint, inputKeys)(state)
Returns the input state objects, containing properties like `value`, `error`, `pristine`, etc.
 
Example output
    
    {
        name: {
            error: 'Fo'
        },
        email: {
            value: 'test@test.com'
        }
    }
    
### valuesSelector(inputsConfigOrMountPoint, inputKeys)(state)
Returns an object of input key to value pairs
 
### validatingSelector(inputsConfigOrMountPoint, inputKeys)(state)
Returns true if *any* inputs corresponding to `inputKeys` are validating, otherwise false.

### pristineSelector(inputsConfigOrMountPoint, inputKeys)(state)
Returns true if *all* inputs corresponding to `inputKeys` are pristine, otherwise false.

### validSelector(inputsConfigOrMountPoint, inputKeys)(state)
Returns true if *all* inputs corresponding to `inputKeys` are valid, otherwise false.
