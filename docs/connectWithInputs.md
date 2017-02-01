## connectWithInputs(inputsConfig:Object, [mapReduxInputsToProps:Function])

Creates a connect function which you use the same way you use `connect` from [react-redux](https://github.com/reactjs/react-redux).

    
    import { connectWithInputs } from 'redux-inputs';
    import inputsConfig from './inputsConfig'; // Your inputs config 
    
    class YourForm extends React.Component {
        render() {
            return (
                <form>
                    ...
                </form>
            );
        }
    }
    
    const connectWithMyForm = connectWithInputs(inputsConfig);
    
    YourForm = connectWithMyForm(mapStateToProps, mapDispatchToProps, mergeProps, options)(YourForm);
    
This will pass down redux inputs props to `YourForm`. By default, they are all added to a prop called `reduxInputs`, but 
can be mapped to props using the `mapReduxInputsToProps` parameter.

Here is the shape of the default `reduxInputs` prop:

    YourForm.propTypes = {
        reduxInputs = React.PropTypes.shape({
            inputProps: React.PropTypes.object,
            setInputs: React.PropTypes.func,
            setErrors: React.PropTypes.func,
            updateAndValidate: React.PropTypes.func,
            validateInputs: React.PropTypes.func,
            resetInputs: React.PropTypes.func,
            initializeInputs: React.PropTypes.func,
            values: React.PropTypes.object,
            validating: React.PropTypes.bool,
            pristine: React.PropTypes.bool,
            valid: React.PropTypes.bool
        })
    };

### Instance props

- `inputProps` *{Object}* contains props for each input in the inputsConfig

- `setInputs(newState, meta)`
- `setErrors(inputKeys, meta)`
- `updateAndValidate(changes, meta)`
- `validateInputs(inputKeys, meta)`
- `resetInputs(inputKeys, meta)`
- `initializeInputs(changes, meta)`

- `values` *{Object}* key-value pairs of the most recent valid values of all inputs
- `validating` *{Boolean}* true if any inputs are currently async validating
- `pristine` *{Boolean}* true if all inputs are untouched, reset, or initialized.
- `valid` *{Boolean}* true if no errors exist on any inputs


### Using `inputProps`

`inputProps` is an important property for hooking up your ReduxInputWrapper wrapped input components. This contains 
everything your components need to represent the state and fire update actions. Exposing more from the previous example:

    import { connectWithInputs } from 'redux-inputs';
    import inputsConfig from './inputsConfig'; // Your inputs config 
    import Input from './Input'; // Your custom input component wrapped in ReduxInputWrapper
        
    class YourForm extends React.Component {
        render() {
            const { inputProps } = this.props.reduxInputs;
            return (
                <form>
                    <Input { ...inputProps.email }/>
                    <Input { ...inputProps.name }/>
                </form>
            );
        }
    }
    
    const connectWithMyForm = connectWithInputs(inputsConfig);
        
    YourForm = connectWithMyForm()(YourForm);
