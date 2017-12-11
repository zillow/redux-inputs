# 2.5.2
- Bug fixes

# 2.5.0
- npm v5
- updated dependencies

# 2.3.0
- Added LocalInputs component

# 2.2.1
- connectWithInputs
    - Extra props are no longer added when mapStateToProps or mapDispatchToProps are not defined.

# 2.2.0
### Added
- Added `inputKeys` parameter to selectors

# 2.1.0
### Added
- setErrors action creator
- setValues action creator

# 2.0.1
- ReduxInputsWrapper
    - Allow wrapped components to access the native onChange callback

# 2.0.0
### Breaking changes
- inputsConfig
    - asyncValidator consolidated into validator. Now return a promise for async validation.
    - Removed ability to set inputState from validators. Instead, return an errorText string from the validate
        function or promise rejection which is added to the inputState. This was the most common use case.
    - Removed _form.metaCreator. This can be done via redux middleware instead.
    - Removed _form, added _reduxMountPoint at the root level
- Renamed setInput -> setInputs for consistency
- Actions
    - setInputs and resetInputs are now thunks instead of plain action creators, to support `onChange`.


### Added
- inputsConfig
    - `onChange(value, inputsState, state, dispatch)` callback

- Actions
    - `initializeInputs(inputConfig, update, meta)` - Just like updateAndValidate, but keeps inputs pristine

- connectWithInputs - new helper function that wraps react-redux's connect and passes down form state, inputProps,
    and pre-bound actions to connected components.

