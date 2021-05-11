import {Action, combineReducers, configureStore} from '@reduxjs/toolkit';
import appReducer from './slicers/app';
import Reactotron from '../../ReactotronConfig';

const combinedReducers = combineReducers({
  app: appReducer,
});

const rootReducer = (state: any | undefined, action: Action) =>
  combinedReducers(state, action);

const store = configureStore({
  reducer: rootReducer,
  enhancers: defaultEnhancers => [
    Reactotron.createEnhancer(),
    ...defaultEnhancers,
  ],
});

export type AppDispatch = typeof store.dispatch;

export default store;
