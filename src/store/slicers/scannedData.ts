import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {State} from 'react-native-gesture-handler';
import {EBaseUrl} from '../models/enums/env.enum';
import {api} from '../utils/api';

export type IScannedDataState = {
  shipments: {
    [key: string]: {
      trackingId: string;
      expectedBundles: any[];
      scannedBundleIds: string[];
      isCompleted: boolean;
    };
  };
  consumer: any;
};

const initialState = {
  shipments: {},
  consumer: null,
};

const name = 'SCANNED_DATA';

export const getUserByToken = createAsyncThunk(
  `${name}/getUserByToken`,
  async () => {
    return api({
      url: `${EBaseUrl.envApiCustomer}/User`,
      method: 'GET',
    });
  },
  {
    serializeError: error => error,
  },
);

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

export const checkPossibleLocations = createAsyncThunk(
  `${name}/checkPossibleLocations`,
  async (trackingNumber: string) => {
    return api({
      method: 'GET',
      url: `${EBaseUrl.envApiLogistics}/Shipment/PossibleLocations/${trackingNumber}`,
    });
  },
  {
    serializeError: error => error,
  },
);

export const deliveryShipment = createAsyncThunk(
  `${name}/deliveryShipment`,
  async formData => {
    return api({
      method: 'PUT',
      url: `${EBaseUrl.envApiLogistics}/Shipment/Give`,
      body: formData,
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
      state.shipments[payload] = {
        trackingId: payload,
        expectedBundles: [],
        scannedBundleIds: [],
        isCompleted: false,
      };
    },
    scanBundle(state, {payload}) {
      const actualShipment = state.shipments[payload.shipmentId];
      actualShipment.expectedBundles = actualShipment.expectedBundles.filter(
        i => i.trackingId !== payload.bundleId,
      );
      actualShipment.scannedBundleIds.push(payload.bundleId);
    },
    setExpectedBundles(state, {payload}) {
      const actualShipment = state.shipments[payload.shipmentId];
      actualShipment.expectedBundles = payload.list;
    },
    setShipmentCompleted(state, {payload}) {
      state.shipments[payload]
        ? (state.shipments[payload].isCompleted = true)
        : undefined;
    },
  },
  extraReducers: builder => {
    builder.addCase(getUserByToken.fulfilled, (state, {payload}) => {
      state.consumer = payload;
    });
  },
});

export const selectShipments = (state: any) => state.scannedData.shipments;
export const selectConsumer = (state: any) => state.scannedData.consumer;
export const selectData = state => state.scannedData;

export const {
  scanShipment,
  scanBundle,
  setExpectedBundles,
  setShipmentCompleted,
} = scannedDataSlice.actions;

export default scannedDataSlice.reducer;
