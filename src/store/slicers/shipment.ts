import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {EBaseUrl} from '../models/enums/env.enum';
import {api} from '../utils/api';

export type IIdentityInitialState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isExpired: boolean;
};

export type IRefreshToken = {
  accessToken: string;
  expDate?: string;
  refreshToken: string;
};
const initialState = {
  shipments: [],
  bundles: [],
  orders: [],
};

const name = 'SHIPMENT';

export const getShipments = createAsyncThunk(
  `${name}/getShipments`,
  async () => {
    return api({
      method: 'GET',
      url: `${EBaseUrl.envApiLogistics}/Shipment/Paged?pn=1&ps=50`,
    });
  },
);

export const getBundles = createAsyncThunk(`${name}/getBundles`, async () => {
  return api({
    method: 'GET',
    url: `${EBaseUrl.envApiLogistics}/Bundle/Accessible?pn=1&ps=50`,
  });
});

export const getOrders = createAsyncThunk(`${name}/getOrders`, async () => {
  return api({
    method: 'GET',
    url: `${EBaseUrl.envApiOrder}/Order/Accessible?pn=1&ps=50`,
  });
});

const appSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getShipments.fulfilled, (state, {payload}) => {
      state.shipments = payload;
    });
    builder.addCase(getBundles.fulfilled, (state, {payload}) => {
      state.bundles = payload;
    });
    builder.addCase(getOrders.fulfilled, (state, {payload}) => {
      state.orders = payload;
    });
  },
});

export const selectShipments = (state: any) => state.shipment.shipments;
export const selectBundles = (state: any) => state.shipment.bundles;
export const selectOrders = (state: any) => state.shipment.orders;

export default appSlice.reducer;
