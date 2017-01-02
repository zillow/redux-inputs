### Step 1 - Prerequisites

Add [redux-thunk](https://github.com/gaearon/redux-thunk) middleware to your store,
 following instructions at that repo.

### Step 2 - [Config](./inputsConfig.md)

Both the reducer and input props creator take a inputsConfig object that defines how inputs are initialized and validated.

### Example

    const inputsConfig = {
        homePrice: {
            defaultValue: 300000,
            validator: (value) => value > 0 && value < 350000000
        }
    }

Create an input configuration object and add a redux-inputs reducer to your redux store in your project's reducers file.

### Step 3 - [Reducer](./createInputsReducer.md)

Give redux-inputs reducer to Redux in your project's reducers file.

    import { combineReducers } from 'redux';
    import { createInputsReducer } from 'redux-inputs';

    const inputsConfig = { email: {} };
    const reducer = combineReducers({
        inputs: createInputsReducer(inputsConfig)
    });

### Step 4 - [Connect](./connectWithInputs.md)

    import { connectWithInputs } from 'redux-inputs';

    const connectWithMyForm = connectWithInputs(inputsConfig);

    YourForm = connectWithMyForm(mapStateToProps, mapDispatchToProps, mergeProps, options)(YourForm);

Create a connect function for your form, which takes the `inputsConfig` and creates a function that has the same
interface as [react-redux](https://github.com/reactjs/react-redux)'s `connect`. This will pass down these additional props to your component, in addition to any
other redux state specified:

### Step 5 - [Wrapper](./ReduxInputsWrapper.md)

    import { ReduxInputsWrapper } from 'redux-inputs';

    let Input = ({id, value, error, errorText, onChange}) => (
        <div>
            <input name={id} onChange={(e) => onChange(e.target.value)}/>
            {error ? <div>{errorText}</div> : null}
        </div>
    );
    Input = ReduxInputsWrapper(Input);

Higher order component that wraps input components and wires them up to the state. This allows all types of inputs to
conform to the same API, and be easily understood and swapped out.

With this set up, you are able make changes to inputs and have them declaratively
 validated and state synchronized with your store. Because this could send actions
 to your store every keystroke, you probably want to use something like a
 [BlurInput](https://github.com/zillow/redux-inputs/blob/master/docs/examples/html-redux-inputs.jsx#L63).
