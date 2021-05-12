import React, {useEffect, useCallback} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/login';
import DashboardScreen from '../screens/dashboard/main';
import {useSelector, useDispatch} from 'react-redux';
import {
  selectAuthStatus,
  selectIsLoading,
  selectIsExpired,
} from '../store/slicers/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setAuth,
  loadingStateOn,
  loadingStateOff,
  refreshToken,
} from '../store/slicers/app';
import Spinner from 'react-native-loading-spinner-overlay';

const Routes = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectAuthStatus);
  const isLoading = useSelector(selectIsLoading);
  const isExpired = useSelector(selectIsExpired);
  const RootStack = createStackNavigator();
  const DashboardStack = createStackNavigator();

  const getToken = useCallback(async () => {
    dispatch(loadingStateOn());
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      dispatch(setAuth(true));
    }
    dispatch(loadingStateOff());
  }, [dispatch]);

  const executeRefreshToken = useCallback(async () => {
    const data = await AsyncStorage.multiGet([
      'accessToken',
      'refreshToken',
      'expDate',
    ]);

    const {meta, payload} = await dispatch(
      refreshToken({accessToken: data[0][1], refreshToken: data[1][1]}),
    );

    if (meta.requestStatus !== 'fulfilled') {
      return;
    }

    await AsyncStorage.multiSet([
      ['accessToken', payload.accessToken],
      ['expDate', payload.expDate.toString()],
    ]);
  }, [dispatch]);

  useEffect(() => {
    getToken();
  }, [getToken]);

  useEffect(() => {
    if (isExpired) {
      executeRefreshToken();
    }
  }, [isExpired, executeRefreshToken]);

  const Dashboard = () => {
    return (
      <DashboardStack.Navigator headerMode="none">
        <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
      </DashboardStack.Navigator>
    );
  };

  return (
    <>
      <Spinner visible={isLoading} />
      <RootStack.Navigator headerMode="none">
        {isAuthenticated ? (
          <RootStack.Screen name="DashboardRoot" component={Dashboard} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </>
  );
};

export default Routes;
