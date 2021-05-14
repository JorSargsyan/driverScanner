import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {EBaseUrl} from '../models/enums/env.enum';
import {api} from '../utils/api';

export type IScannedDataState = {
  shipment: string;
  expectedBundles: any[];
  scannedBundleIds: string[];
};

const initialState = {
  expectedBundles: [],
  scannedBundleIds: [],
  shipment: '',
};

const name = 'SCANNED_DATA';

export const acceptShipment = createAsyncThunk(
  `${name}/acceptShipment`,
  async (bundleIds: number[]) => {
    return api({
      method: 'PUT',
      body: bundleIds,
      url: `${EBaseUrl.envApiLogistics}/Bundle/Accept/Tracking`,
    });
  },
  {
    serializeError: error => error,
  },
);

export const checkIsShipment = createAsyncThunk(
  `${name}/checkIsShipment`,
  async (code: string) => {
    return api({
      method: 'GET',
      url: `${EBaseUrl.envApiLogistics}/BundleShipment/Bundles/Tracking/${code}`,
    });
  },
  {
    serializeError: error => error,
  },
);

const scannedDataSlice = createSlice({
  name,
  initialState,
  reducers: {
    scanShipment(state, {payload}) {
      state.shipment = payload;
      state.expectedBundles = [];
      state.scannedBundleIds = [];
    },
    scanBundle(state, {payload}) {
      state.expectedBundles = state.expectedBundles.filter(
        i => i.trackingId !== payload,
      );
      state.scannedBundleIds.push(payload);
    },
    setExpectedBundles(state, {payload}) {
      state.expectedBundles = payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(acceptShipment.fulfilled, state => {
      state.shipment = '';
      state.expectedBundles = [];
      state.scannedBundleIds = [];
    });
  },
});

export const selectShipment = (state: any) => state.scannedData.shipment;
export const selectExpectedBundlesList = (state: any) =>
  state.scannedData.expectedBundles;
export const selectScannedBundleIds = (state: any) =>
  state.scannedData.scannedBundleIds;

export const {
  scanShipment,
  scanBundle,
  setExpectedBundles,
} = scannedDataSlice.actions;

export default scannedDataSlice.reducer;
