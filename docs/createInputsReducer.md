## createInputsReducer(inputsConfig:Object)

You use this create reducers for your forms. You need one reducer per form. 

Example:

    import { createStore, combineReducers } from 'redux';
    import { reducer as formReducer } from 'redux-form';
    
    const inputsConfig = {
        ... redux-inputs configuration ...
    };
    
    const reducers = {
        inputs: createInputsReducer(inputsConfig)
    };
    
    const reducer = combineReducers(reducers);
    const store = createStore(reducer);
    
### Use a different redux mount point

By default, redux-inputs assumes the reducer is mounted at `inputs`. For mounting in a different location, or 
when multiple forms are stored in the state, use this special property in your inputsConfig object:

#### `_reduxMountPoint` *(String)* change 

    inputsConfig = {
        _reduxMountPoint: 'tab1.inputs'
        ... other inputs config ...
    };
    
In this example your state would look like this:

    {
        tab1: {
            inputs: {}
        }
    }

### Multiple forms

Create an inputsConfig for each form, making sure that each have a unique `_reduxMountPoint`.

    const inputsConfigOne = {
        _reduxMountPoint: 'formOne',
        ... inputs configuration
    };
    const inputsConfigTwo = {
        _reduxMountPoint: 'formTwo',
        ... inputs configuration        
    };
    
    const reducers = {
        formOne: createInputsReducer(inputsConfigOne)
        formTwo: createInputsReducer(inputsConfigTwo)
    };
    
    const reducer = combineReducers(reducers);
    
If your forms are similar and you want to share an input config, you can assign the common parts to each inputs config.

