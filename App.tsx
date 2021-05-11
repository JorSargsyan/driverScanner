import React, {useEffect} from 'react';

import {Colors, Spacings} from 'react-native-ui-lib';
import {ThemeManager} from 'react-native-ui-lib';
import store from './src/store';
import {Provider} from 'react-redux';
import Routes from './src/routing';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Colors.loadColors({
  blue: '#0049c2',
  orange: '#f15000',
});

const App = () => {
  return (
    <NavigationContainer>
      <Provider store={store}>
        <Routes />
      </Provider>
    </NavigationContainer>
  );
};

export default App;
