# 2.0.0
### Breaking changes
- inputConfig
    - asyncValidator consolidated into validator. Now return a promise for async validation.
    - Removed ability to set inputState from validators. Instead, return an errorText string from the validate 
        function or promise rejection which is added to the inputState. This was the most common use case.
    - Removed _form.metaCreator. This can be done via redux middleware instead.
- Renamed setInput -> setInputs for consistency 
- Actions
    - setInputs and resetInputs are now thunks instead of plain action creators, to support `onChange`. 
   
    
### Added
- inputConfig 
    - `onChange(value, inputsState, state, dispatch)` callback 
    
- Actions
    - `initializeInputs(inputConfig, update, meta)` - Just like updateAndValidate, but keeps inputs pristine
    
- connectWithInputs - new helper function that wraps react-redux's connect and passes down form state, inputProps, 
    and pre-bound inputActions to connected components.
    
