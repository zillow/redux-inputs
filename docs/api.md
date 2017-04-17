# API

### [inputsConfig:Object](./inputsConfig.md)
An object you create for each form and pass to the `createInputsReducer` and `connectWithInputs` 

### [connectWithInputs(inputsConfig:Object, [mapReduxInputsToProps:Function)]](./connectWithInputs.md)
Used to connect your form component to Redux. Passes down redux-input related props.

### [createInputsReducer(inputsConfig:Object)](./createInputsReducer.md)
Used to create reducers for forms

### [ReduxInputsWrapper(InputComponent:Component, [options:Object])](./ReduxInputsWrapper.md)
The higher-order component for wrapping your input components so they can be passed redux-inputs props from the connectWithInputs.

### [Action Creators](./actionCreators.md)
All the actions available to modify the inputs

### [Selectors](./selectors.md)
[Reselect](https://github.com/reactjs/reselect) selectors for computing derived data from the state

### [Redux State](./reduxState.md)
This explains exactly how redux-inputs stores the state

### [LocalInputs](./LocalInputs.md)
A Component that provides a quick way to set up and use redux-inputs locally 
