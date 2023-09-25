import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  scanMode: 'delivery' | 'accept' | null;
};

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isExpired: false,
  scanMode: null,
};

const name = 'APP';

export const authenticate = createAsyncThunk(
  `${name}/authenticate`,
  async (credentials: {userName: string; password: string}) => {
    return api({
      method: 'POST',
      body: {...credentials, deviceID: '', fcmToken: '', customerType: 2},
      url: `${EBaseUrl.envApiIdentity}/Connect/Token`,
    });
  },
);

export const refreshToken = createAsyncThunk(
  `${name}/refreshToken`,
  async ({accessToken, refreshToken}: IRefreshToken) => {
    return api({
      method: 'PUT',
      body: {accessToken, refreshToken},
      url: `${EBaseUrl.envApiIdentity}/Connect/Token`,
    });
  },
);

const appSlice = createSlice({
  name,
  initialState,
  reducers: {
    signOut(state) {
      state.isAuthenticated = false;
    },
    setAuth(state) {
      state.isAuthenticated = true;
    },
    loadingStateOn(state) {
      state.isLoading = true;
    },
    loadingStateOff(state) {
      state.isLoading = false;
    },
    setIsExpired(state) {
      state.isExpired = true;
    },
    setScanMode(state, {payload}) {
      state.scanMode = payload;
    },
  },
});

export const selectAuthStatus = (state: any) => state.app.isAuthenticated;
export const selectIsLoading = (state: any) => state.app.isLoading;
export const selectIsExpired = (state: any) => state.app.isExpired;
export const selectScanMode = (state: any) => state.app.scanMode;

export const {
  signOut,
  setAuth,
  loadingStateOff,
  loadingStateOn,
  setScanMode,
  setIsExpired,
} = appSlice.actions;

export default appSlice.reducer;
