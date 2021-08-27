import React, {useEffect} from 'react';

import store from './src/store';
import {Provider} from 'react-redux';
import Routes from './src/routing';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeProvider, Button} from 'react-native-elements';

export const theme = {
  colors: {
    primary: '#fa4716',
    secondary: '#000000',
  },
  Button: {
    raised: true,
  },
};

const App = () => {
  return (
    <NavigationContainer>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <Routes />
        </Provider>
      </ThemeProvider>
    </NavigationContainer>
  );
};

export default App;
