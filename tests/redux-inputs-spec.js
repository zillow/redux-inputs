import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import { createInputsReducer } from '../src';
import { SET_INPUT, LOADING } from '../src/actions/actionTypes';
import { setInput, loading, updateAndValidate, validateInputs, resetInputs } from '../src/actions';
import { DEFAULT_REDUX_MOUNT_POINT, getInputProps, createOnChangeWithTransform } from '../src/util/helpers';
import ReduxInputsWrapper from '../src/util/ReduxInputsWrapper';

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

        const initialState = {
            email: {
                value: undefined,
            }
        };

        it('should not throw any errors', () => {
            expect(fn).to.not.throw(Error);
        });
        it('should initialize default values', () => {
            let reducer = fn();
            let state = reducer();
            expect(state).to.deep.equal({
                _form: {},
                ...initialState
            })
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
                _form: {},
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
                _form: {},
                ...initialState,
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
                _form: {},
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
                _form: {},
                email: { value: undefined },
                name: { value: 'test' },
                phone: { value: 123 }
            });
        });
        it('should only listen to actions with correct reduxMountPoint', () => {
            let reducer = createInputsReducer({
                _form: {
                    reduxMountPoint: 'alternate'
                }
            });

            let state = reducer();
            expect(state).to.deep.equal({
                _form: {}
            });

            state = reducer(state, {
                type: SET_INPUT,
                payload: {
                    email: { value: 'test@test.com' },
                },
                meta: {
                    reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT
                }
            });
            expect(state).to.deep.equal({
                _form: {}
            });

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
                _form: {},
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

        const initialState = {
            positiveNumber: {
                value: undefined
            }
        };

        it('should not throw any errors', () => {
            expect(fn).to.not.throw(Error);
        });
        it('should initialize default values', () => {
            let reducer = fn();
            let state = reducer();
            expect(state).to.deep.equal({
                _form: {},
                ...initialState
            })
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
                _form: {},
                positiveNumber: { value: 1 }
            });
        });
    });
});

describe('setInput action creator', () => {
    it('should create a valid SET_INPUT action', () => {
        let action = setInput({}, {
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
        let action = setInput({}, {
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
        let action = setInput({
            // Input Config
            _form: {
                reduxMountPoint: 'alternate'
            }
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
    it('should add additional meta data using metaCreator in inputConfig', () => {
        let action = setInput({
            _form: {
                metaCreator: (action) => ({
                    analytics: {
                        type: 'analytics-event',
                        payload: {
                            type: action.type
                        }
                    }
                })
            }
        }, {
            email: { value: 'test@test.com' }
        });
        expect(action).to.deep.equal({
            type: SET_INPUT,
            payload: { email: { value: 'test@test.com' } },
            error: false,
            meta: {
                analytics: {
                    type: 'analytics-event',
                    payload: {
                        type: SET_INPUT
                    }
                },
                reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT
            }
        });
    });
});

describe('resetInputs action creator', () => {
    it('should return a RI_SET_INPUT action', () => {
        let actual = resetInputs({});
        expect(actual.type).to.equal('RI_SET_INPUT');
    });
    it('should return values back to their defaults', () => {
        let actual = resetInputs({ blank: {}, defaulted: { defaultValue: 2 }});
        expect(actual.payload).to.deep.equal({
            blank: { value: undefined },
            defaulted: { value: 2}
        });
    });
});

describe('loading action creator', () => {
    it('should create a valid LOADING action', () => {
        let action = loading({}, true);
        expect(action).to.deep.equal({
            type: LOADING,
            payload: true,
            meta: { reduxMountPoint: DEFAULT_REDUX_MOUNT_POINT }
        });
    });
});


describe('updateAndValidate thunk', () => {
    it('correctly dispatches client side validation changes when valid', () => {
        let thunk = updateAndValidate({
            email: {
                validator: value => (value && value.length > 0)
            }
        }, {
            email: 'test@test.com'
        });

        thunk((action) => {
            // Capture dispatched action
            expect(action).to.deep.equal({
                type: 'RI_SET_INPUT',
                payload: {
                    email: { value: 'test@test.com', loading: false }
                },
                error: false,
                meta: { reduxMountPoint: 'inputs' }
            });
        }, () => ({
            // Mocked initial state
            inputs: {}
        }));
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
                    email: { value: 'previous', error: 'test', loading: false }
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
    it('correctly dispatches client side validation inputState setting', () => {
        let thunk = updateAndValidate({
            email: {
                validator: value => {
                    if (!value) {
                        return false
                    } else if (value.length < 5) {
                        return {
                            error: value,
                            errorText: 'Too short!'
                        }
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
                    email: { error: 'test', errorText: 'Too short!' }
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
            _form: {
                reduxMountPoint: 'page.inputs'
            },
            email: {
                validator: value => (value && value.length > 0)
            }
        }, {
            email: ''
        });

        thunk((action) => {
            // Capture dispatched action
            expect(action).to.deep.equal({
                type: 'RI_SET_INPUT',
                payload: {
                    email: { value: 'test@test.com', error: '', loading: false }
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
                payload: { email: { value: 'valid', loading: false } },
                error: false,
                meta: { reduxMountPoint: 'inputs' }
            });
        }, () => ({ inputs: { email: { value: 'valid' } } }) /* getState */).then((results) => {
            expect(results).to.deep.equal({
                email: { value: 'valid', loading: false }
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
                payload: { email: { value: undefined, error: '', loading: false } },
                error: true,
                meta: { reduxMountPoint: 'inputs' }
            });
        }, () => ({ inputs: { email: { value: undefined } } }) /* getState */).then(null, (erroredInputs) => {
            // Reject
            expect(erroredInputs).to.equal({
                email: { value: undefined, error: '', loading: false }
            });
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
    it('returns objects with _id set', () => {
        const actual = getInputProps(basicInputConfig, basicInputState, noop);
        expect(actual.email._id).to.equal('email');
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
        expect(actual.email._id).to.equal('email');
        expect(actual.name._id).to.equal('name');
    });
    it('throws an invariant error when ids are not present in state', () => {
        const actualFn = () => getInputProps(multiInputConfig, basicInputState, noop);
        expect(actualFn).to.throw();
    });
});
const promiseThunk = () => Promise.resolve();
const promiseRejectThunk = () => Promise.reject();
describe('createOnChangeWithTransform', () => {
    it('returns a function', () => {
        expect(createOnChangeWithTransform('id', noop)).to.be.a('function');
    });
    it('returned function runs onChangeTransform on the given event', () => {
        const onChangeTransform = sinon.spy();
        const actual = createOnChangeWithTransform('id', promiseThunk, onChangeTransform);
        actual('val');
        expect(onChangeTransform.calledWith('val')).to.be.true;
    });
    it('returned function runs parser on the onChangeTransform value', () => {
        const parser = sinon.spy();
        const actual = createOnChangeWithTransform('id', promiseThunk, () => 'val2', parser);
        actual('val');
        expect(parser.calledWith('val2')).to.be.true;
    });
    it('returned function calls dispatchChange with an object with parsed value', () => {
        const dispatchChange = sinon.spy(promiseThunk);
        const actual = createOnChangeWithTransform('email', dispatchChange, () => 'val2');
        actual('val');
        expect(dispatchChange.calledOnce).to.be.true;
        const args = dispatchChange.args[0];
        expect(args[0]).to.deep.equal({ email: 'val2' });
    });
    it('returned function returns a promise', () => {
        const onChange = createOnChangeWithTransform('id', promiseThunk);
        const actual = onChange('val');
        expect(actual.then).to.be.a('function');
    });
    it('returned function calls resolve on dispatch resolution', () => {
        const resolve = sinon.spy();
        const onChange = createOnChangeWithTransform('id', promiseThunk, undefined, undefined, resolve);
        return onChange('val').then(() => {
            expect(resolve.calledOnce).to.be.true;
        });
    });
    it('returned function call reject on dispatch rejection', () => {
        const reject = sinon.spy();
        const onChange = createOnChangeWithTransform('id', promiseRejectThunk, undefined, undefined, undefined, reject);
        return onChange('val').then(() => {
            expect(reject.calledOnce).to.be.true;
        });
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
    });
});
