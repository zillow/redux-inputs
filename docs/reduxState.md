## Redux state shape

You should rarely have to use the state stored by redux-inputs directly, because the props passed down from
connectWithInputs covers most cases. Regardless, the state for a form in redux looks like this:

    {
        email: {
            value: 'test@test.com',    
            error: '244535'
        }
    }

This represents a form with one input where the user first typed 'test@test.com', 
 but changed it to '244535', which is invalid. 

### Input

This is the state stored for each input defined in your inputsConfig

- `value`: The last valid state the input had.
- `error`: The state of the input if invalid, undefined otherwise. Should be displayed as value if present.
- `pristine`: True if the input hasn't been touched or set by anything other than defaultValue or initialization
- `validating`: True when async validation is in progress on this input
- `errorText`: Passed down string from validator describing the error
