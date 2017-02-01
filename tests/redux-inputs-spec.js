import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import configureMockStore from 'redux-mock-store';
import reduxThunk from 'redux-thunk';
import { createInputsReducer } from '../src';
import { SET_INPUT } from '../src/actions/actionTypes';
import { _setInputs, setInputs, updateAndValidate, validateInputs, resetInputs, setErrors, initializeInputs } from '../src/actions';
import { DEFAULT_REDUX_MOUNT_POINT } from '../src/util/mountPoint';
import getInputProps from '../src/util/getInputProps';
import connectWithInputs from '../src/util/connectWithInputs';
import { formSelector } from '../src/util/selectors';
import ReduxInputsWrapper, { createOnChangeWithTransform } from '../src/util/ReduxInputsWrapper';

const mockStore = configureMockStore([reduxThunk]);

describe('createInputsReducer', () => {
    describe('no input config', () => {
        it('should throw an error', () => {
            expect(createInputsReducer).to.throw(Error);
        });
    });
    describe('one input, no validation', () => {
        let fn = () => createInputsReducer({
            email: {}
        });

        it('should not throw any errors', () => {
            expect(fn).to.not.throw(Error);
        });
        it('should initialize default values', () => {
            let reducer = fn();
            let state = reducer();
            expect(state).to.deep.equal({
                email: {
                    value: undefined,
                    pristine: true
                }
            });
        });
        it('should accept SET_INPUT for inputs defined in inputConfig', () => {
            let reducer = fn();
            let state = reducer();
            state = reducer(state, {
                type: SET_INPUT,
                payload: {
                    email: {
                        value: 'test@test.com'
                    }
                },
                meta: {
                    reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT
                }
            });
            expect(state).to.deep.equal({
                email: { value: 'test@test.com' }
            });
        });
        it('should also accept SET_INPUT for inputs NOT defined in inputConfig', () => {
            let reducer = fn();
            let state = reducer();
            state = reducer(state, {
                type: SET_INPUT,
                payload: { name: { value: 'test' }},
                meta: {
                    reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT
                }
            });
            expect(state).to.deep.equal({
                email: {
                    pristine: true,
                    value: undefined
                },
                name: { value: 'test' }
            });
        });
        it('should ignore SET_INPUT for invalid inputs, while accepting valid inputs', () => {
            let reducer = fn();
            let state = reducer();
            state = reducer(state, {
                type: SET_INPUT,
                payload: {
                    email: { value: 'test@test.com' },
                    name: { value: 'test' }
                },
                meta: {
                    reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT
                }
            });
            expect(state).to.deep.equal({
                email: { value: 'test@test.com' },
                name: { value: 'test' }
            });
        });
        it('should add inputs missing from previous state that are in inputConfig to new state', () => {
            let reducer = createInputsReducer({
                email: {},
                name: { defaultValue: 'test' }
            });
            let state = reducer({
                // Previous state
                phone: { value: 123 }
            });
            expect(state).to.deep.equal({
                email: { value: undefined, pristine: true },
                name: { value: 'test', pristine: true },
                phone: { value: 123 }
            });
        });
        it('should only listen to actions with correct reduxMountPoint', () => {
            let reducer = createInputsReducer({
                _reduxMountPoint: 'alternate'
            });

            let state = reducer();
            expect(state).to.deep.equal({});

            state = reducer(state, {
                type: SET_INPUT,
                payload: {
                    email: { value: 'test@test.com' },
                },
                meta: {
                    reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT
                }
            });
            expect(state).to.deep.equal({});

            state = reducer(state, {
                type: SET_INPUT,
                payload: {
                    email: { value: 'test@test.com' },
                },
                meta: {
                    reduxMountPoint: 'alternate'
                }
            });
            expect(state).to.deep.equal({
                email: { value: 'test@test.com' }
            });
        });
    });
    describe('one input, client-side validation', () => {
        let fn = () => createInputsReducer({
            positiveNumber: {
                validator: (val) => val > 0
            }
        });

        it('should not throw any errors', () => {
            expect(fn).to.not.throw(Error);
        });
        it('should initialize default values', () => {
            let reducer = fn();
            let state = reducer();
            expect(state).to.deep.equal({
                positiveNumber: {
                    pristine: true,
                    value: undefined
                }
            });
        });
        it('should accept SET_INPUT for valid input', () => {
            let reducer = fn();
            let state = reducer();
            state = reducer(state, {
                type: SET_INPUT,
                payload: {
                    positiveNumber: {
                        value: 1
                    }
                },
                meta: {
                    reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT
                }
            });
            expect(state).to.deep.equal({
                positiveNumber: { value: 1 }
            });
        });
    });
});

describe('_setInputs action creator', () => {
    it('should create a valid SET_INPUT action', () => {
        let action = _setInputs({}, {
            email: { value: 'test@test.com' }
        });
        expect(action).to.deep.equal({
            type: SET_INPUT,
            payload: { email: { value: 'test@test.com' } },
            error: false,
            meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
        });
    });
    it('should set error correctly on errored payload', () => {
        let action = _setInputs({}, {
            email: { error: 'test@test.com' }
        });
        expect(action).to.deep.equal({
            type: SET_INPUT,
            payload: { email: { error: 'test@test.com' } },
            error: true,
            meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
        });
    });
    it('should set reduxMountPoint meta information based on inputConfig settings', () => {
        let action = _setInputs({
            // Input Config
            _reduxMountPoint: 'alternate'
        }, {
            email: { value: 'test@test.com' }
        });
        expect(action).to.deep.equal({
            type: SET_INPUT,
            payload: { email: { value: 'test@test.com' } },
            error: false,
            meta: { reduxMountPoint: 'alternate' }
        });
    });
});

describe('setInputs thunk', () => {
    it('should create a valid SET_INPUT action', () => {
        const thunk = setInputs({
            email: {}
        }, {
            email: { value: 'test@test.com' }
        });

        thunk(action => { // dispatch
            expect(action).to.deep.equal({
                type: SET_INPUT,
                payload: { email: { value: 'test@test.com' } },
                error: false,
                meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
            });
        }, () => ({
            [DEFAULT_REDUX_MOUNT_POINT]: {}
        }));
    });
    it('should fire onChange for changed inputs', () => {
        const expectedActions = [{
            type: SET_INPUT,
            payload: {
                email: { value: 'test@test.com' },
                name: { value: 'nombre' }
            },
            error: false,
            meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
        }];
        const store = mockStore({ inputs: { email: { value: 'storevalue' }}});
        const thunk = setInputs({
            email: {
                onChange: (inputState, inputs, state, dispatch) => {
                    expect(typeof dispatch).to.equal('function');
                    expect(inputState).to.deep.equal({ value: 'test@test.com' });
                    expect(inputs).to.deep.equal({
                        email: { value: 'storevalue' }
                    });
                    expect(state).to.deep.equal({
                         inputs: { email: { value: 'storevalue' } }
                    });
                }
            },
            name: {
                onChange: (inputState) => {
                    expect(inputState).to.deep.equal({
                        value: 'nombre'
                    });
                }
            }
        }, {
            email: { value: 'test@test.com' },
            name: { value: 'nombre' }
        });

        return store.dispatch(thunk).then(() => {
            expect(store.getActions()).to.deep.equal(expectedActions);
        });
    });
    it('should not fire onChange for changed inputs when passing suppressChange', () => {
        const expectedActions = [{
            type: SET_INPUT,
            payload: {
                email: { value: 'test@test.com' }
            },
            error: false,
            meta: {
                reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT,
                suppressChange: true
            }
        }];
        const store = mockStore({ inputs: { email: { value: 'storevalue' }}});
        const onChangeSpy = sinon.spy();
        const thunk = setInputs({
            email: {
                onChange: onChangeSpy
            }
        }, {
            email: { value: 'test@test.com' }
        }, {
            suppressChange: true
        });

        return store.dispatch(thunk).then(() => {
            expect(store.getActions()).to.deep.equal(expectedActions);
            expect(onChangeSpy.callCount).to.equal(0);
        });
    });
});

describe('resetInputs thunk', () => {
    it('should return a RI_SET_INPUT action', () => {
        const thunk = resetInputs({});
        thunk(action => {
            expect(action.type).to.equal('RI_SET_INPUT');
        }, () => ({
            [DEFAULT_REDUX_MOUNT_POINT]: {}
        }));
    });
    it('should return values back to their defaults', () => {
        const thunk = resetInputs({ blank: {}, defaulted: { defaultValue: 2 }});
        thunk(action => {
            expect(action.payload).to.deep.equal({
                blank: {value: undefined, pristine: true},
                defaulted: {value: 2, pristine: true}
            });
        }, () => ({
            [DEFAULT_REDUX_MOUNT_POINT]: {}
        }));
    });
    it('should only return values specified back to their defaults', () => {
        const thunk = resetInputs({ blank: {}, defaulted: { defaultValue: 2 }}, ['blank']);
        thunk(action => {
            expect(action.payload).to.deep.equal({
                blank: {value: undefined, pristine: true}
            });
        }, () => ({
            [DEFAULT_REDUX_MOUNT_POINT]: {}
        }));
    });
});

describe('updateAndValidate thunk', () => {
    it('correctly dispatches client side validation changes when valid', () => {
        const expectedActions = [{
            type: SET_INPUT,
            payload: { email: { value: 'test@test.com', validating: false } },
            error: false,
            meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
        }];
        const store = mockStore({ inputs: { email: { value: '' } } });
        const thunk = updateAndValidate({
            email: {
                validator: value => (value && value.length > 0)
            }
        }, {
            email: 'test@test.com'
        });

        return store.dispatch(thunk).then(() => {
            expect(store.getActions()).to.deep.equal(expectedActions);
        });
    });
    it('should not fire unnecessary setInputs', () => {
        const expectedActions = [];
        const store = mockStore({ inputs: { email: { value: 'test@test.com', validating: false } } });
        const thunk = updateAndValidate({
            email: {
                validator: value => (value && value.length > 0)
            }
        }, {
            email: 'test@test.com'
        });

        return store.dispatch(thunk).then(() => {
            expect(store.getActions()).to.deep.equal(expectedActions);
        });
    });
    it('should not fire unnecessary async validation', () => {
        const expectedActions = [{
            type: SET_INPUT,
            payload: { email: { value: 'test@test.com', validating: false } },
            error: false,
            meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
        }];
        const store = mockStore({ inputs: { email: { value: 'test@test.com' } } });
        const thunk = updateAndValidate({
            email: {
                validator: () => Promise.resolve()
            }
        }, {
            email: 'test@test.com'
        });

        return store.dispatch(thunk).then(() => {
            expect(store.getActions()).to.deep.equal(expectedActions);
        });
    });
    it('should not fire async validation more than once while validating', () => {
        const expectedActions = [{
            type: SET_INPUT,
            payload: { email: { value: 'test@test.com' } },
            error: false,
            meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
        }];
        const store = mockStore({ inputs: { email: { value: 'test@test.com', validating: true } } });
        const cb = sinon.stub();
        const thunk = updateAndValidate({
            email: {
                validator: () => new Promise((resolve) => {
                    setTimeout(() => {
                        cb();
                        resolve();
                    }, 5);
                })
            }
        }, {
            email: 'test@test.com'
        });

        store.dispatch(thunk);
        return store.dispatch(thunk).then(() => {
            expect(store.getActions()).to.deep.equal(expectedActions);
            expect(cb.callCount).to.equal(1);
        });
    });
    it('correctly dispatches client side validation changes when errored', () => {
        let thunk = updateAndValidate({
            email: {
                validator: value => (value && value.length > 5)
            }
        }, {
            email: 'test'
        });

        thunk((action) => {
            // Capture dispatched action
            expect(action).to.deep.equal({
                type: 'RI_SET_INPUT',
                payload: {
                    email: { value: 'previous', error: 'test', validating: false }
                },
                error: true,
                meta: { reduxMountPoint: 'inputs' }
            });
        }, () => ({
            // Mocked initial state
            inputs: {
                email: { value: 'previous' }
            }
        }));
    });
    it('correctly dispatches client side validation with errorText', () => {
        let thunk = updateAndValidate({
            email: {
                validator: value => {
                    if (!value) {
                        return false;
                    } else if (value.length < 5) {
                        return 'Too short!';
                    }
                    return false;
                }
            }
        }, {
            email: 'test'
        });

        thunk((action) => {
            // Capture dispatched action
            expect(action).to.deep.equal({
                type: 'RI_SET_INPUT',
                payload: {
                    email: {
                        error: 'test',
                        errorText: 'Too short!',
                        validating: false,
                        value: 'previous'
                    }
                },
                error: true,
                meta: { reduxMountPoint: 'inputs' }
            });
        }, () => ({
            // Mocked initial state
            inputs: {
                email: { value: 'previous' }
            }
        }));
    });
    it('works with deep reduxMountPoint', () => {
        let thunk = updateAndValidate({
            _reduxMountPoint: 'page.inputs',
            email: {
                validator: value => !!(value && value.length > 0)
            }
        }, {
            email: ''
        });

        thunk((action) => {
            // Capture dispatched action
            expect(action).to.deep.equal({
                type: 'RI_SET_INPUT',
                payload: {
                    email: { value: 'test@test.com', error: '', validating: false }
                },
                error: true,
                meta: { reduxMountPoint: 'page.inputs' }
            });
        }, () => ({
            // Mocked initial state
            page: {
                inputs: {
                    email: { value: 'test@test.com' }
                }
            }
        }));
    });
    it('correctly dispatches async validation VALID changes', () => {
        const expectedActions = [{
            error: false,
            meta: { reduxMountPoint: 'inputs' },
            payload: { email: { validating: true, value: 'test@test.com' }},
            type: 'RI_SET_INPUT'
        }, {
            error: false,
            meta: { reduxMountPoint: 'inputs' },
            payload: { email: { value: 'test@test.com' }},
            type: 'RI_SET_INPUT'
        }];
        const store = mockStore({ inputs: {} });
        const thunk = updateAndValidate({
            email: {
                validator: () => Promise.resolve()
            }
        }, {
            email: 'test@test.com'
        });

        return store.dispatch(thunk).then(null, (changed) => {
            expect(store.getActions()).to.deep.equal(expectedActions);
            expect(changed).to.deep.equal({
                email: { value: 'test@test.com' }
            });
        });
    });
    it('correctly dispatches async validation INVALID changes', () => {
        const expectedActions = [{
            error: false,
            meta: { reduxMountPoint: 'inputs' },
            payload: { email: { validating: true, value: 'test@test.com' }},
            type: 'RI_SET_INPUT'
        }, {
            error: true,
            meta: { reduxMountPoint: 'inputs' },
            payload: { email: {
                error: 'test@test.com',
                value: undefined
            }},
            type: 'RI_SET_INPUT'
        }];
        const store = mockStore({ inputs: {} });
        const thunk = updateAndValidate({
            email: {
                validator: () => Promise.reject()
            }
        }, {
            email: 'test@test.com'
        });

        return store.dispatch(thunk).then(null, (changed) => {
            expect(store.getActions()).to.deep.equal(expectedActions);
            expect(changed).to.deep.equal({
                email: {
                    error: 'test@test.com',
                    value: undefined
                }
            });
        });
    });
    it('correctly dispatches async validation INVALID changes with errorText', () => {
        let thunk = updateAndValidate({
            email: {
                validator: () => Promise.reject('Invalid domain!')
            }
        }, {
            email: 'test@test.com'
        });

        const stubbedDispatch = sinon.stub();

        return thunk(stubbedDispatch, () => ({
            // Mocked initial state
            inputs: {}
        })).then(null, inputState => {
            expect(inputState).to.deep.equal({
                email: {
                    error: 'test@test.com',
                    errorText: 'Invalid domain!',
                    value: undefined
                }
            });
            expect(stubbedDispatch.getCall(0).args[0]).to.deep.equal({
                error: false,
                meta: { reduxMountPoint: 'inputs' },
                payload: { email: { validating: true, value: 'test@test.com' }},
                type: 'RI_SET_INPUT'
            });
            expect(stubbedDispatch.getCall(1).args[0]).to.deep.equal({
                error: true,
                meta: { reduxMountPoint: 'inputs' },
                payload: { email: {
                    error: 'test@test.com',
                    errorText: 'Invalid domain!',
                    value: undefined
                }},
                type: 'RI_SET_INPUT'
            });
        });
    });
    it('correctly dispatches mixed client + async validation VALID changes', () => {
        const expectedActions = [{
            error: false,
            meta: { reduxMountPoint: 'inputs' },
            payload: {
                email: { validating: true, value: 'test@test.com' },
                name: { validating: false, value: 'Bob' }
            },
            type: 'RI_SET_INPUT'
        }, {
            error: false,
            meta: { reduxMountPoint: 'inputs' },
            payload: { email: { value: 'test@test.com' }},
            type: 'RI_SET_INPUT'
        }];
        const store = mockStore({ inputs: {} });
        const thunk = updateAndValidate({
            email: {
                validator: () => Promise.resolve()
            },
            name: {
                validator: value => !!value && value.length > 2
            }
        }, {
            email: 'test@test.com',
            name: 'Bob'
        });

        return store.dispatch(thunk).then(null, (changed) => {
            expect(store.getActions()).to.deep.equal(expectedActions);
            expect(changed).to.deep.equal({
                email: { value: 'test@test.com' },
                name: { value: 'Bob', validating: false }
            });
        });
    });
    it('correctly dispatches mixed invalid client + valid async validation changes', () => {
        const expectedActions = [{
            error: true,
            meta: { reduxMountPoint: 'inputs' },
            payload: {
                email: { validating: true, value: 'test@test.com' },
                name: { validating: false, error: 'Jo', value: undefined }
            },
            type: 'RI_SET_INPUT'
        }, {
            error: false,
            meta: { reduxMountPoint: 'inputs' },
            payload: { email: { value: 'test@test.com' }},
            type: 'RI_SET_INPUT'
        }];
        const store = mockStore({ inputs: {} });
        const thunk = updateAndValidate({
            email: {
                validator: () => Promise.resolve()
            },
            name: {
                validator: value => !!value && value.length > 2
            }
        }, {
            email: 'test@test.com',
            name: 'Jo'
        });

        return store.dispatch(thunk).then(null, (changed) => {
            expect(store.getActions()).to.deep.equal(expectedActions);
            expect(changed).to.deep.equal({
                name: { error: 'Jo', validating: false, value: undefined }
            });
        });
    });
    it('correctly dispatches mixed valid client + invalid async validation changes', () => {
        const expectedActions = [{
            error: false,
            meta: { reduxMountPoint: 'inputs' },
            payload: {
                email: { validating: true, value: 'test@test.com' },
                name: { validating: false, value: 'Bob' }
            },
            type: 'RI_SET_INPUT'
        }, {
            error: true,
            meta: { reduxMountPoint: 'inputs' },
            payload: { email: { error: 'test@test.com', value: undefined }},
            type: 'RI_SET_INPUT'
        }];
        const store = mockStore({ inputs: {} });
        const thunk = updateAndValidate({
            email: {
                validator: () => Promise.reject()
            },
            name: {
                validator: value => !!value && value.length > 2
            }
        }, {
            email: 'test@test.com',
            name: 'Bob'
        });

        return store.dispatch(thunk).then(null, (changed) => {
            expect(store.getActions()).to.deep.equal(expectedActions);
            expect(changed).to.deep.equal({
                email: { error: 'test@test.com', value: undefined }
            });
        });
    });
    it('should fire onChange for changed inputs', () => {
        const expectedActions = [{
            type: SET_INPUT,
            payload: {
                email: {
                    value: 'test@test.com',
                    validating: true
                }
            },
            error: false,
            meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
        }, {
            type: SET_INPUT,
            payload: {
                email: {
                    value: 'test@test.com'
                }
            },
            error: false,
            meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
        }];
        const store = mockStore({ inputs: { email: { value: 'storevalue' }}});
        const onChangeSpy = sinon.spy();
        const thunk = updateAndValidate({
            email: {
                onChange: onChangeSpy,
                validator: value => !!value && value.length > 5 && Promise.resolve()
            }
        }, {
            email: 'test@test.com'
        });

        return store.dispatch(thunk).then(() => {
            expect(store.getActions()).to.deep.equal(expectedActions);
            expect(onChangeSpy.callCount).to.equal(2);
            expect(onChangeSpy.getCall(0).args[0]).to.deep.equal({
                value: 'test@test.com',
                validating: true
            });
            expect(onChangeSpy.getCall(1).args[0]).to.deep.equal({
                value: 'test@test.com'
            });
        });
    });
    it('should suppress onChange for changed inputs when suppressChange is passed', () => {
        const expectedActions = [{
            type: SET_INPUT,
            payload: {
                email: {
                    error: 'te',
                    value: 'storevalue',
                    validating: false
                }
            },
            error: true,
            meta: {
                reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT,
                suppressChange: true
            }
        }];
        const store = mockStore({ inputs: { email: { value: 'storevalue' }}});
        const onChangeSpy = sinon.spy();
        const thunk = updateAndValidate({
            email: {
                onChange: onChangeSpy,
                validator: value => !!value && value.length > 2
            }
        }, {
            email: 'te'
        }, {
            suppressChange: true
        });

        return store.dispatch(thunk).then(null, () => {
            expect(store.getActions()).to.deep.equal(expectedActions);
            expect(onChangeSpy.callCount).to.equal(0);

        });
    });
});

describe('validateInputs thunk', () => {
    it('passes valid inputs', () => {
        let thunk = validateInputs({
            email: {
                validator: value => (value && value.length > 0)
            }
        }, ['email']);

        thunk((action) => {
            expect(action).to.deep.equal({
                type: 'RI_SET_INPUT',
                payload: { email: { value: 'valid', validating: false } },
                error: false,
                meta: { reduxMountPoint: 'inputs', validate: true }
            });
        }, () => ({ inputs: { email: { value: 'valid' } } }) /* getState */).then((results) => {
            expect(results).to.deep.equal({
                email: { value: 'valid', validating: false }
            });
        });
    });
    it('fails invalid inputs', () => {
        let thunk = validateInputs({
            email: {
                validator: value => !!(value && value.length > 0)
            }
        }, ['email']);

        thunk((action) => { // Dispatch
            expect(action).to.deep.equal({
                type: 'RI_SET_INPUT',
                payload: { email: { value: undefined, error: '', validating: false } },
                error: true,
                meta: { reduxMountPoint: 'inputs', validate: true }
            });
        }, () => ({ inputs: { email: { value: undefined } } }) /* getState */).then(null, (erroredInputs) => {
            // Reject
            expect(erroredInputs).to.equal({
                email: { value: undefined, error: '', validating: false }
            });
        });
    });
});


describe('setErrors thunk', () => {
    it('sets current value to error property', () => {
        const expectedActions = [{
            type: SET_INPUT,
            payload: { email: { value: 'test@test.com', error: 'test@test.com' } },
            error: true,
            meta: { reduxMountPoint: 'inputs' }
        }];
        const store = mockStore({ inputs: {
            email: { value: 'test@test.com' },
            name: {},
            phone: { value: '(555) 555 - 5555'}
        } });
        const thunk = setErrors({
            email: {},
            name: {},
            phone: {}
        }, ['email']);

        return store.dispatch(thunk).then(() => {
            expect(store.getActions()).to.deep.equal(expectedActions);
        });
    });
    it('sets current value to error property even if value is undefined', () => {
        const expectedActions = [{
            type: SET_INPUT,
            payload: {
                name: { error: '' },
                phone: { value: '(555) 555 - 5555', error: '(555) 555 - 5555'}
            },
            error: true,
            meta: { reduxMountPoint: 'inputs' }
        }];
        const store = mockStore({ inputs: {
            email: { value: 'test@test.com' },
            name: {},
            phone: { value: '(555) 555 - 5555'}
        } });
        const thunk = setErrors({
            email: {},
            name: {},
            phone: {}
        }, ['name', 'phone']);

        return store.dispatch(thunk).then(() => {
            expect(store.getActions()).to.deep.equal(expectedActions);
        });
    });
});

describe('initializeInputs thunk', () => {
    it('passes valid inputs', () => {
        let thunk = initializeInputs({
            email: {
                validator: value => (value && value.length > 0)
            }
        }, { email: 'test@test.com'});

        thunk((action) => {
            expect(action).to.deep.equal({
                type: 'RI_SET_INPUT',
                payload: { email: { value: 'test@test.com', validating: false, pristine: true } },
                error: false,
                meta: { reduxMountPoint: 'inputs', initialize: true }
            });
        }, () => ({ inputs: { email: { value: 'valid' } } }) /* getState */).then((results) => {
            expect(results).to.deep.equal({
                email: { value: 'test@test.com', validating: false, pristine: true }
            });
        });
    });
});

describe('connectWithInputs', () => {
    it('adds all the right props', () => {
        const connectStub = sinon.stub();
        const connectOutput = sinon.stub();

        connectStub.returns(connectOutput);

        connectWithInputs(
            {
                email: {}
            },
            reduxInputs => ({ reduxInputs }),
            connectStub
        )(i => i)(() => <div/>);

        expect(connectStub.calledOnce).to.be.true;
        const initialProps = {
            inputs: {
                email: {
                    value: 'test@test.com',
                    pristine: true
                }
            }
        };
        const store = mockStore({ inputs: { email: { value: 'test@test.com', pristine: true } } });
        const mapStateToProps = connectStub.args[0][0];
        const mapDispatchToProps = connectStub.args[0][1];
        const mergeProps = connectStub.args[0][2];

        const stateProps = mapStateToProps(initialProps);
        const dispatchProps = mapDispatchToProps(store.dispatch, initialProps);
        const finalProps = mergeProps(stateProps, dispatchProps, initialProps);

        expect(finalProps.reduxInputs).to.exist;
        expect(typeof finalProps.reduxInputs.setInputs === 'function').to.be.true;
        expect(typeof finalProps.reduxInputs.validateInputs === 'function').to.be.true;
        expect(typeof finalProps.reduxInputs.updateAndValidate === 'function').to.be.true;
        expect(typeof finalProps.reduxInputs.resetInputs === 'function').to.be.true;
        expect(typeof finalProps.reduxInputs.initializeInputs === 'function').to.be.true;
        expect(finalProps.reduxInputs.values).to.deep.equal({
            email: 'test@test.com'
        });
        expect(finalProps.reduxInputs.validating).to.be.false;
        expect(finalProps.reduxInputs.pristine).to.be.true;
        expect(finalProps.reduxInputs.valid).to.be.true;
        expect(finalProps.dispatch).to.exist;
        expect(finalProps.inputs).to.deep.equal({
            email: { value: 'test@test.com', pristine: true }
        });

        return finalProps.reduxInputs.inputProps.email.dispatchChange('new@test.com').then((inputs) => {
            expect(inputs).to.deep.equal({
                email: {
                    value: 'new@test.com',
                    validating: false
                }
            });
            expect(store.getActions()).to.deep.equal([{
                type: SET_INPUT,
                payload: {
                    email: {
                        value: 'new@test.com',
                        validating: false
                    }
                },
                error: false,
                meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
            }]);
        });
    });
    it('inputActions are bound and working', () => {
        const connectStub = sinon.stub();
        const connectOutput = sinon.stub();

        connectStub.returns(connectOutput);

        connectWithInputs(
            {
                email: {}
            },
            reduxInputs => ({ reduxInputs }),
            connectStub
        )(i => i)(() => <div/>);

        expect(connectStub.calledOnce).to.be.true;
        const initialProps = {
            inputs: {
                email: {
                    value: 'test@test.com',
                    pristine: true
                }
            }
        };
        const store = mockStore({ inputs: { email: { value: 'test@test.com', pristine: true } } });
        const mapStateToProps = connectStub.args[0][0];
        const mapDispatchToProps = connectStub.args[0][1];
        const mergeProps = connectStub.args[0][2];

        const stateProps = mapStateToProps(initialProps);
        const dispatchProps = mapDispatchToProps(store.dispatch, initialProps);
        const finalProps = mergeProps(stateProps, dispatchProps, initialProps);

        return finalProps.reduxInputs.updateAndValidate({ email: 'new@test.com' }).then((inputs) => {
            expect(inputs).to.deep.equal({
                email: {
                    value: 'new@test.com',
                    validating: false
                }
            });
            expect(store.getActions()).to.deep.equal([{
                type: SET_INPUT,
                payload: {
                    email: {
                        value: 'new@test.com',
                        validating: false
                    }
                },
                error: false,
                meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
            }]);
        });
    });
});

const noop = () => {};
describe('getInputProps', () => {
    const basicInputConfig = { email: {} };
    const multiInputConfig = { email: {}, name: {} };
    const extraPropsInputConfig = { email: { props: { formatter: 3 } } };
    const basicInputState = { email: { value: 1 } };
    const multiInputState = { email: { value: 1 }, name: { value: 4 } };
    const errorInputState = { email: { value: 1, error: 2 } };
    const errorTextState = { email: { value: 1, errorText: 'GANKSHARK' } };
    const altMountInputConfig = { _reduxMountPoint: 'alt', email: {}};
    it('returns objects with _id set', () => {
        const actual = getInputProps(basicInputConfig, basicInputState, noop);
        expect(actual.email._id).to.equal('inputs:email');
    });
    it('handles non-errored inputs', () => {
        const actual = getInputProps(basicInputConfig, basicInputState, noop);
        expect(actual.email.value).to.equal(1);
        expect(actual.email.error).to.be.false;
    });
    it('handles errored inputs', () => {
        const actual = getInputProps(basicInputConfig, errorInputState, noop);
        expect(actual.email.value).to.equal(2);
        expect(actual.email.error).to.be.true;
    });
    it('passes along extra props from the config to the input', () => {
        const actual = getInputProps(extraPropsInputConfig, errorInputState, noop);
        expect(actual.email.formatter).to.equal(3);
    });
    it('passes errorText from state to input', () => {
        const actual = getInputProps(basicInputConfig, errorTextState, noop);
        expect(actual.email.errorText).to.equal('GANKSHARK');
    });
    it('binds dispatchChange to dispatch', () => {
        const dispatch = sinon.spy();
        const actual = getInputProps(basicInputConfig, basicInputState, dispatch);
        expect(actual.email.dispatchChange).to.be.a('function');
        actual.email.dispatchChange({});
        expect(dispatch.calledOnce).to.be.true;
    });
    it('handles multiple objects', () => {
        const actual = getInputProps(multiInputConfig, multiInputState, noop);
        expect(actual.email._id).to.equal('inputs:email');
        expect(actual.name._id).to.equal('inputs:name');
    });
    it('throws an invariant error when ids are not present in state', () => {
        const actualFn = () => getInputProps(multiInputConfig, basicInputState, noop);
        expect(actualFn).to.throw();
    });
    it('works with alternative mount points', () => {
        const actual = getInputProps(altMountInputConfig, basicInputState, noop);
        expect(actual.email._id).to.equal('alt:email');
    });
});
const promiseThunk = () => Promise.resolve();
describe('createOnChangeWithTransform', () => {
    it('returns a function', () => {
        expect(createOnChangeWithTransform('id', noop, noop)).to.be.a('function');
    });
    it('returned function runs onChangeTransform on the given event', () => {
        const onChangeTransform = sinon.spy();
        const actual = createOnChangeWithTransform(promiseThunk, noop, onChangeTransform);
        actual('val');
        expect(onChangeTransform.calledWith('val')).to.be.true;
    });
    it('returned function runs parser on the onChangeTransform value', () => {
        const parser = sinon.spy();
        const actual = createOnChangeWithTransform(promiseThunk, noop, () => 'val2', parser);
        actual('val');
        expect(parser.calledWith('val2')).to.be.true;
    });
    it('returned function calls dispatchChange with an object with parsed value', () => {
        const dispatchChange = sinon.spy(promiseThunk);
        const actual = createOnChangeWithTransform(dispatchChange, noop, () => 'val2');
        actual('val');
        expect(dispatchChange.calledOnce).to.be.true;
        const args = dispatchChange.args[0];
        expect(args[0]).to.deep.equal('val2');
    });
    it('returned function calls onChange if it exists with the native event', () => {
        const onChange = sinon.spy();
        const actual = createOnChangeWithTransform(promiseThunk, onChange);
        actual('val');
        expect(onChange.calledOnce).to.be.true;
        const args = onChange.args[0];
        expect(args[0]).to.deep.equal('val');
    });
    it('returned function returns a promise', () => {
        const onChange = createOnChangeWithTransform(promiseThunk);
        const actual = onChange('val');
        expect(actual.then).to.be.a('function');
    });
});
describe('ReduxInputsWrapper', () => {
    function Component(props) {
        return <div {...props}/>;
    }
    it('returns a functional component', () => {
        expect(ReduxInputsWrapper(Component)).to.be.a('function');
    });
    describe('returned component', () => {
        it('renders the given component', () => {
            const wrapped = ReduxInputsWrapper(Component);
            const rendered = wrapped({ _id: 'email', dispatchChange: noop });
            expect(rendered.type).to.equal(Component);
        });
        it('passes value if no formatter is given', () => {
            const wrapped = ReduxInputsWrapper(Component);
            const rendered = wrapped({ _id: 'email', dispatchChange: noop, value: 'logical' });
            expect(rendered.props.value).to.equal('logical');
        });
        it('formats a value if a formatter is given', () => {
            const wrapped = ReduxInputsWrapper(Component);
            const rendered = wrapped({
                _id: 'email', dispatchChange: noop,
                value: 'logical',
                formatter: () => 'formatted'
            });
            expect(rendered.props.value).to.equal('formatted');
        });
        it('uses _id as id if not overridden', () => {
            const wrapped = ReduxInputsWrapper(Component);
            const rendered = wrapped({
                _id: 'email', dispatchChange: noop
            });
            expect(rendered.props.id).to.equal('email');
        });
        it('allows overriding the given id', () => {
            const wrapped = ReduxInputsWrapper(Component);
            const rendered = wrapped({
                _id: 'email', dispatchChange: noop,
                id: 'overwrite',
                value: 'logical',
                formatter: () => 'formatted'
            });
            expect(rendered.props.id).to.equal('overwrite');
        });
        it('calls resolve after dispatching change', () => {
            const wrapped = ReduxInputsWrapper(Component);
            const rendered = wrapped({
                _id: 'email', dispatchChange: Promise.resolve(),
                id: 'overwrite',
                value: 'logical',
                formatter: () => 'formatted'
            });
            expect(rendered.props.id).to.equal('overwrite');
        });
    });
});

describe('Selectors', () => {
    const testState1 = {
        inputs: {
            email: {
                value: 'test@test.com',
                pristine: true
            },
            name: {
                value: 'bobby',
                pristine: true
            }
        }
    };
    const testState2 = {
        inputs: {
            email: {
                value: 'test@test.com',
                validating: true
            },
            name: {
                error: 'bo'
            }
        }
    };
    describe('values selector', () => {
        it('works with defined values', () => {
            const { values } = formSelector({})(testState1);
            expect(values).to.deep.equal({
                email: 'test@test.com',
                name: 'bobby'
            });
        });
        it('works with undefined values', () => {
            const { values } = formSelector({})(testState2);
            expect(values).to.deep.equal({
                email: 'test@test.com',
                name: undefined
            });
        });
        it('works with no values', () => {
            const { values } = formSelector({})({inputs: {}});
            expect(values).to.deep.equal({});
        });
    });
    describe('validating selector', () => {
        it('works with no validating inputs', () => {
            const { validating } = formSelector({})(testState1);
            expect(validating).to.be.false;
        });
        it('works with one validating input', () => {
            const { validating } = formSelector({})(testState2);
            expect(validating).to.be.true;
        });
        it('works with no inputs', () => {
            const { validating } = formSelector({})({inputs: {}});
            expect(validating).to.be.false;
        });
    });
    describe('valid selector', () => {
        it('works with no invalid inputs', () => {
            const { valid } = formSelector({})(testState1);
            expect(valid).to.be.true;
        });
        it('works with one invalid input', () => {
            const { valid } = formSelector({})(testState2);
            expect(valid).to.be.false;
        });
        it('works with no inputs', () => {
            const { valid } = formSelector({})({inputs: {}});
            expect(valid).to.be.true;
        });
    });
    describe('pristine selector', () => {
        it('works with pristine inputs', () => {
            const { pristine } = formSelector({})(testState1);
            expect(pristine).to.be.true;
        });
        it('works with dirty inputs', () => {
            const { pristine } = formSelector({})(testState2);
            expect(pristine).to.be.false;
        });
        it('works with no inputs', () => {
            const { pristine } = formSelector({})({inputs: {}});
            expect(pristine).to.be.true;
        });
    });
});
