import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {EBaseUrl} from '../models/enums/env.enum';
import {api} from '../utils/api';

export type IIdentityInitialState = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

const initialState = {
  isAuthenticated: false,
  isLoading: false,
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

const appSlice = createSlice({
  name,
  initialState,
  reducers: {
    signOut(state) {
      AsyncStorage.multiRemove(['accessToken', 'expDate', 'refreshToken']).then(
        () => {
          state.isAuthenticated = false;
        },
      );
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
  },
});

export const selectAuthStatus = (state: any) => state.app.isAuthenticated;
export const selectIsLoading = (state: any) => state.app.isLoading;

export const {
  signOut,
  setAuth,
  loadingStateOff,
  loadingStateOn,
} = appSlice.actions;

export default appSlice.reducer;
