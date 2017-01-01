import invariant from 'invariant';
import _mapValues from 'lodash/mapValues';
import _omit from 'lodash/omit';

import { getReduxMountPoint, REDUX_MOUNT_POINT } from './mountPoint';
import { updateAndValidate } from '../actions';
/**
 * Helper function for providing props to redux-input controlled components
 * @param inputConfig
 * @param state - redux-inputs form state
 * @param dispatcher
 */
export default (inputConfig, inputsState, dispatch) => (
    _mapValues(_omit(inputConfig, REDUX_MOUNT_POINT), (config, id) => {
        const inputState = inputsState[id];
        invariant(inputState, `[redux-inputs]: ${id} not found in state. Make sure to configure your redux-input reducer.`);

        const { value, error, ...otherState } = inputState;
        const hasError = typeof error !== 'undefined';

        return {
            _id: [getReduxMountPoint(inputConfig), id].join(':'),
            value: hasError ? error : value,
            error: hasError,

            // Prebound change callback
            dispatchChange: newVal => dispatch(updateAndValidate(inputConfig, {
                [id]: newVal
            })),

            // Props from config
            ...config.props,

            // Other properties in inputState passed down as props (e.g. errorText)
            ...otherState
        };
    })
);
