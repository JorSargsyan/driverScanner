import React, {useEffect, useCallback} from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import ScannerScreen from '../screens/dashboard/scanner';
import LoginScreen from '../screens/login';
import DashboardScreen from '../screens/dashboard/main';
import {useSelector, useDispatch} from 'react-redux';
import {selectAuthStatus, selectIsLoading} from '../store/slicers/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setAuth, loadingStateOn, loadingStateOff} from '../store/slicers/app';

const Loading = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="white" />
  </View>
);

const Routes = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectAuthStatus);
  const isLoading = useSelector(selectIsLoading);
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

  useEffect(() => {
    getToken();
  }, [getToken]);

  const Dashboard = () => {
    return (
      <DashboardStack.Navigator headerMode="none">
        <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
        <DashboardStack.Screen name="Scanner" component={ScannerScreen} />
      </DashboardStack.Navigator>
    );
  };

  return (
    <>
      {!isLoading && (
        <RootStack.Navigator headerMode="none">
          {isAuthenticated ? (
            <RootStack.Screen name="DashboardRoot" component={Dashboard} />
          ) : (
            <RootStack.Screen name="Login" component={LoginScreen} />
          )}
        </RootStack.Navigator>
      )}
      {isLoading && <Loading />}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    zIndex: 99,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignContent: 'center',
    justifyContent: 'center',
  },
});

export default Routes;
