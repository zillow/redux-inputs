import invariant from 'invariant';
import _property from 'lodash/property';
import _reduce from 'lodash/reduce';
import _isEmpty from 'lodash/isEmpty';
import _includes from 'lodash/includes';

import { getReduxMountPoint, DEFAULT_REDUX_MOUNT_POINT } from './mountPoint';

export function getInputsFromState(inputConfigOrMountPoint = DEFAULT_REDUX_MOUNT_POINT, state, inputKeys) {
    const mountPoint = typeof inputConfigOrMountPoint === 'string' ? inputConfigOrMountPoint
        : getReduxMountPoint(inputConfigOrMountPoint);

    const inputsState = _property(mountPoint)(state);
    invariant(inputsState, `[redux-inputs]: no state found at '${mountPoint}', check your reducers to make sure it exists or change reduxMountPoint in your inputConfig.`);

    if (inputKeys) {
        return _reduce(inputsState, (result, input, key) => {
            if (_includes(inputKeys, key)) {
                result[key] = input;
            }
            return result;
        }, {});
    } else {
        return inputsState;
    }
}

export function inputsWithErrors(inputs) {
    const erroredInputs = _reduce(inputs, (result, input, key) => {
        if (typeof input.error !== 'undefined') {
            result[key] = input;
        }
        return result;
    }, {});

    return _isEmpty(erroredInputs) ? false : erroredInputs;
}
