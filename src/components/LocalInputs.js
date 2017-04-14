import React from 'react';
import PropTypes from 'prop-types';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { createInputsReducer } from '../reducers';
import connectWithInputs from '../util/connectWithInputs';

/**
 * Creates a local store for redux-inputs unique to this component and its children
 * The caveat here is that if the component unmounts, the store is destroyed, just like component state
 */
export default class LocalInputs extends React.Component {
    constructor(props) {
        super(props);
        const { inputsConfig } = props;
        this._store = createStore(
            combineReducers({
                inputs: createInputsReducer(inputsConfig)
            }),
            applyMiddleware(thunk)
        );
        this._ConnectedInputs = connectWithInputs(inputsConfig)()(
            ({ reduxInputs, children }) => children(reduxInputs)
        );
    }
    render() {
        const { children } = this.props;
        const ConnectedInputs = this._ConnectedInputs;
        // Connects children component in propsMode so we don't have to set up a `Provider`
        return <ConnectedInputs store={this._store} children={children}/>;
    }
}

LocalInputs.propTypes = {
    inputsConfig: PropTypes.object.isRequired,
    children: PropTypes.func.isRequired // Callback with reduxInputs props
};
