import _mapValues from 'lodash/mapValues';
import _forEach from 'lodash/forEach';
import _omit from 'lodash/omit';
import invariant from 'invariant';

import { FORM_KEY, getReduxMountPoint } from '../util/helpers';

import { SET_INPUT } from '../actions/actionTypes';

function getDefaultInputState(config) {
    return {
        value: config.defaultValue,
        pristine: true
    };
}

export function getDefaultInputs(inputConfig) {
    return _mapValues(_omit(inputConfig, FORM_KEY), getDefaultInputState);
}

function _matchesReduxMountPoint(inputConfig, action) {
    return getReduxMountPoint(inputConfig) === (action.meta && action.meta.reduxMountPoint);
}

function _syncStateWithInputConfig(inputConfig, state) {
    const otherInputs = {};
    let nsync = true;

    _forEach(inputConfig, (config, key) => {
        if (key !== FORM_KEY && typeof state[key] === 'undefined') {
            otherInputs[key] = getDefaultInputState(config);
            nsync = false;
        }
    });

    return nsync ? state : {
        ...otherInputs,
        ...state
    };
}

export function createInputsReducer(inputConfig) {
    invariant(inputConfig, '[redux-inputs]: inputConfig must be defined');
    return (state = getDefaultInputs(inputConfig), action = {}) => {
        if (_matchesReduxMountPoint(inputConfig, action)) {
            switch (action.type) {
                case SET_INPUT:
                    return {
                        ...state,
                        ...action.payload
                    };
            }
        }
        return _syncStateWithInputConfig(inputConfig, state);
    };
}
