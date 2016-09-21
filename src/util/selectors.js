import _reduce from 'lodash/reduce';
import _some from 'lodash/some';

import { createSelector } from 'reselect';

import { getInputsFromState } from './helpers';

export const inputsSelector = inputConfig => state => getInputsFromState(inputConfig, state);

const getValues = inputs => _reduce(inputs, (acc, input, key) => ({
    ...acc,
    [key]: input.value
}), {});

const isValidating = inputs => _some(inputs, input => input.validating);

export const createFormSelector = inputConfig => createSelector(
    inputsSelector(inputConfig),
    inputs => ({
        values: getValues(inputs),
        validating: isValidating(inputs)
    })
);
