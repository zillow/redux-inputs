## LocalInputs

This React component that takes a inputsConfig, creates a local store, and calls `children` back with `reduxInputs`. 

#### Props
- `inputsConfig` {Object} 
- `children` {Function} a callback function that receives `reduxInputs` and should return a node to render.

Uses [connectWithInputs](./connectWithInputs.md) within to provide `reduxInputs` props.
 
#### Example
Using `ReduxInputsField` created in single-file example

    <LocalInputs inputsConfig={{ email: {}}}>
        {(reduxInputs) => (
            <div>
                <ReduxInputsField {...reduxInputs.inputProps.email}/>
            </div>
        )}
    </LocalInputs>
