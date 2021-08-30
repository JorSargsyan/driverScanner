import {Action, combineReducers, configureStore} from '@reduxjs/toolkit';
import appReducer from './slicers/app';
import scannedDataReducer from './slicers/scannedData';
import shipmentReducer from './slicers/shipment';
import Reactotron from '../../ReactotronConfig';
import errorHandling from './middleware/errorHandle';

const combinedReducers = combineReducers({
  app: appReducer,
  scannedData: scannedDataReducer,
  shipment: shipmentReducer,
});

const rootReducer = (state: any | undefined, action: Action) =>
  combinedReducers(state, action);

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(errorHandling),
  enhancers: defaultEnhancers => [
    Reactotron.createEnhancer(),
    ...defaultEnhancers,
  ],
});

export type AppDispatch = typeof store.dispatch;

export default store;
