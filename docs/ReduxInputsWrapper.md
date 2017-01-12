## ReduxInputsWrapper(InputComponent:Component, [options:Object])

This higher-order component is used to create components that can be used with `inputProps` from [connectWithInputs](connectWithInputs.md).

#### Arguments
- `InputComponent` *(Component)*
- `options` *(Object)*
- - `onChangeTransform` *(Function)* [optional] Turn a browser change event into a value. (e.g. `e => e.target.value` for `input`)

#### Props passed down to the wrapped component

- `id` *(string)*: unique id for this input, can be used to link label and input
- `value` *(any)*: represents the current value as defined by the input's state
- `error` *(boolean)*: True if the current value is invalid
- `errorText` *(string)*
- `onChange` *(function)*: Takes one parameter - the new value
- `validating` *(boolean)*: True while async validation is in progress
- `pristine` *(boolean)*: True if the input hasn't been touched or set by anything other than defaultValue or initialization

#### Props added to composed component

- `parser(value:Any)` *(function)* transforms the new value before validating and updating
- `formatter(value:Any)` *(function)* transforms the stored value before passing to the component
- `onValidationSuccess(inputs:Object)` *(function)* callback after successful change - same as resolve of updateAndValidate
    - `inputs` *(Object)* object of changed input(s)
- `onValidationFail(inputs:Object)` *(function)* callback after failed validation - same as reject of updateAndValidate
    - `inputs` *(Object)* object of changed input(s)

The `ReduxInputsWrapper` looks at the input and turns it into `value`, and `error` props, where `value` is equal to
`inputs.email.value` if `inputs.email.error` is undefined, or `inputs.email.error` otherwise. The `ReduxInputsWrapper`
passes down any other properties of the input state untouched, with the exception of `onChange` which will be called
after redux-inputs changes are dispatched.
Then this input can be used in the render of connected `YourForm` like this:

    render() {
        const { inputProps } = this.props.reduxInputs;

        return (
            <Input {...inputProps.email}/>
        );
    }

Changes from this input will be validated and dispatched, then passed back through component update.
