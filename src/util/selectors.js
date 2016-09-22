import _reduce from 'lodash/reduce';
import _some from 'lodash/some';

import { createSelector } from 'reselect';

import { getInputsFromState } from './helpers';

export const createInputsSelector = inputConfig => state => getInputsFromState(inputConfig, state);

const getValuesFromInputs = inputs => _reduce(inputs, (acc, input, key) => ({
    ...acc,
    [key]: input.value
}), {});

const areInputsValidating = inputs => _some(inputs, input => input.validating);
const areInputsPristine = inputs => !_some(inputs, input => !input.pristine);

export const createFormSelector = inputConfig => createSelector(
    createInputsSelector(inputConfig),
    inputs => ({
        values: getValuesFromInputs(inputs),
        validating: areInputsValidating(inputs),
        pristine: areInputsPristine(inputs)
    })
);
