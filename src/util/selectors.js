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

export const inputsSelector = (inputConfig, inputKeys) => state => getInputsFromState(inputConfig, state, inputKeys);

export const valuesSelector = (inputConfig, inputKeys) => createSelector(
    inputsSelector(inputConfig, inputKeys),
    getValuesFromInputs
);

export const validatingSelector = (inputConfig, inputKeys) => createSelector(
    inputsSelector(inputConfig, inputKeys),
    areInputsValidating
);

export const pristineSelector = (inputConfig, inputKeys) => createSelector(
    inputsSelector(inputConfig, inputKeys),
    areInputsPristine
);

export const validSelector = (inputConfig, inputKeys) => createSelector(
    inputsSelector(inputConfig, inputKeys),
    areInputsValid
);

export const formSelector = (inputConfig, inputKeys) => createSelector(
    valuesSelector(inputConfig, inputKeys),
    validatingSelector(inputConfig, inputKeys),
    pristineSelector(inputConfig, inputKeys),
    validSelector(inputConfig, inputKeys),
    (values, validating, pristine, valid) => ({
        values,
        validating,
        pristine,
        valid
    })
);
