import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {EBaseUrl} from '../models/enums/env.enum';
import {api} from '../utils/api';

export type IScannedDataState = {
  shipment: string;
  expectedBundles: any[];
  scannedBundleIds: number[];
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
      url: `${EBaseUrl.envApiOrder}/Order/Accept`,
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
      const scannedBundle = state.expectedBundles.filter(
        i => i.trackingId === payload,
      );
      if (!state.scannedBundleIds.includes(scannedBundle.id)) {
        state.scannedBundleIds.push(scannedBundle.id);
      } else {
        alert('Bundle is already scanned!!');
      }
    },
    setExpectedBundles(state, {payload}) {
      state.expectedBundles = payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(acceptShipment.fulfilled, state => {
      state.shipment = '';
      state.expectedBundles = [];
    });
  },
});

export const selectShipment = (state: any) => state.scannedData.shipment;
export const selectExpectedBundlesList = (state: any) =>
  state.scannedData.expectedBundles;

export const {
  scanShipment,
  scanBundle,
  setExpectedBundles,
} = scannedDataSlice.actions;

export default scannedDataSlice.reducer;
