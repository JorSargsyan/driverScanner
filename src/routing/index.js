import React, {useEffect, useCallback} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';

import LoginScreen from '../screens/login';
import ScanScreen from '../screens/dashboard/scanScreen';
import ShipmentScreen from '../screens/dashboard/shipment';
import BundleScreen from '../screens/dashboard/bundle';

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
import {theme} from '../../App';

const Routes = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectAuthStatus);
  const isLoading = useSelector(selectIsLoading);
  const isExpired = useSelector(selectIsExpired);
  const Drawer = createDrawerNavigator();
  const StackAuth = createStackNavigator();
  const ShipmentStack = createStackNavigator();

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

  const ShipmentNavigator = () => {
    return (
      <ShipmentStack.Navigator
        initialRouteName="Shipment"
        screenOptions={{headerShown: false}}>
        <ShipmentStack.Screen name="Shipment" component={ShipmentScreen} />
        <ShipmentStack.Screen name="Scan" component={ScanScreen} />
      </ShipmentStack.Navigator>
    );
  };

  const DrawerNavigator = () => {
    return (
      <Drawer.Navigator
        initialRouteName="Shipment"
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: theme.colors.primaryOpacity,
        }}>
        <Drawer.Screen
          name="ShipmentRoot"
          options={{
            drawerLabel: 'Բեռնախմբեր',
          }}
          component={ShipmentNavigator}
        />
        <Drawer.Screen
          name="Bundle"
          options={{drawerLabel: 'Պարկեր'}}
          component={BundleScreen}
        />
        {/* <Drawer.Screen
          name="Orders"
          options={{drawerLabel: 'Առաքանիներ'}}
          component={OrderScreen}
        /> */}
      </Drawer.Navigator>
    );
  };

  return (
    <>
      {isAuthenticated && <DrawerNavigator name="Dashboard" />}
      {!isAuthenticated && (
        <StackAuth.Navigator
          initialRouteName="Login"
          screenOptions={{headerShown: false}}>
          <StackAuth.Screen name="Login" component={LoginScreen} />
        </StackAuth.Navigator>
      )}
    </>
  );
};

export default Routes;
