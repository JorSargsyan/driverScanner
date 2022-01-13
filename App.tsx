import React from 'react';

import store from './src/store';
import {Provider} from 'react-redux';
import Routes from './src/routing';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider} from 'react-native-elements';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import {View, Text} from 'react-native';

export const theme = {
  colors: {
    primary: '#fa4716',
    secondary: '#000000',
    primaryOpacity: '#fa47169e',
  },
  Button: {
    raised: true,
  },
};

const toastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: props => (
    <BaseToast
      {...props}
      style={{backgroundColor: 'green'}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
      }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: props => (
    <ErrorToast
      {...props}
      style={{backgroundColor: 'red'}}
      text1Style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
      }}
    />
  ),
  /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
  tomatoToast: ({text1, props}) => (
    <View style={{height: 60, width: '100%', backgroundColor: 'tomato'}}>
      <Text>{text1}</Text>
      <Text>{props.uuid}</Text>
    </View>
  ),
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <Provider store={store}>
          <Routes />
        </Provider>
        <Toast config={toastConfig} />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
