import _reduce from 'lodash/reduce';
import _some from 'lodash/some';

import { createSelector } from 'reselect';

import { getInputsFromState, inputsWithErrors } from './helpers';

const getValuesFromInputs = inputs => _reduce(inputs, (acc, input, key) => ({
    ...acc,
    [key]: input.value
}), {});
const areInputsValidating = inputs => _some(inputs, input => input.validating);
const areInputsPristine = inputs => !_some(inputs, input => !input.pristine);
const areInputsValid = inputs => !inputsWithErrors(inputs);

export const inputsSelector = inputConfig => state => getInputsFromState(inputConfig, state);

export const valuesSelector = inputConfig => createSelector(
    inputsSelector(inputConfig),
    getValuesFromInputs
);

export const validatingSelector = inputConfig => createSelector(
    inputsSelector(inputConfig),
    areInputsValidating
);

export const pristineSelector = inputConfig => createSelector(
    inputsSelector(inputConfig),
    areInputsPristine
);

export const validSelector = inputConfig => createSelector(
    inputsSelector(inputConfig),
    areInputsValid
);

export const formSelector = inputConfig => createSelector(
    valuesSelector(inputConfig),
    validatingSelector(inputConfig),
    pristineSelector(inputConfig),
    validSelector(inputConfig),
    (values, validating, pristine, valid) => ({
        values,
        validating,
        pristine,
        valid
    })
);
