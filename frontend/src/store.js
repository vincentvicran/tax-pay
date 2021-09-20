import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { createLogger } from 'redux-logger';

import { authReducer, forgotPasswordReducer, userReducer } from './reducers/userReducers';
import { vehiclesReducer } from './reducers/vehicleReducers';
import { insurancesReducer } from './reducers/insuranceReducers';
import { paymentsReducer } from './reducers/paymentReducer';

import { loadState } from './localStorage';

const persistedState = loadState();

const reducer = combineReducers({
    vehicles: vehiclesReducer,
    auth: authReducer,
    user: userReducer,
    forgotPassword: forgotPasswordReducer,
    insurances: insurancesReducer,
    payments: paymentsReducer,
});

// let initialState = {};

const middleware = [thunk, createLogger()];

const store = createStore(reducer, persistedState, applyMiddleware(...middleware));

export default store;
