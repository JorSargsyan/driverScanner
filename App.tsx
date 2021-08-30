import React, {useEffect} from 'react';

import store from './src/store';
import {Provider} from 'react-redux';
import Routes from './src/routing';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider, Button} from 'react-native-elements';

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

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <Provider store={store}>
          <Routes />
        </Provider>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
