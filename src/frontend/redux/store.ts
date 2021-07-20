import { Store, applyMiddleware, createStore } from 'redux';
import rootReducer, { Action, GlobalState } from './reducers';

import { Actions } from './actionTypes';
import thunk from 'redux-thunk';

const store = createStore<GlobalState, Action, {}, GlobalState>(
  rootReducer,
  applyMiddleware<{ type: string }, GlobalState>(thunk)
);

export default store as Store<GlobalState, Actions>;
