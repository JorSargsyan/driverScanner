import React, {useReducer} from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../store';
import {authenticate, setAuth} from '../store/slicers/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button, Input, Image} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {theme} from '../../App';

const reducer = (state, action) => {
  switch (action.type) {
    case 'userName':
      return {...state, userName: action.payload};
    case 'password':
      return {...state, password: action.payload};
    default:
      throw new Error();
  }
};

export default ({navigation}): JSX.Element => {
  const [state, dispatchState] = useReducer(reducer, {
    userName: '',
    password: '',
  });
  const dispatch = useDispatch<AppDispatch>();

  const handleChange = name => text => {
    dispatchState({type: name, payload: text});
  };

  const handleSubmit = async () => {
    const {meta, payload} = await dispatch(authenticate(state));
    if (meta.requestStatus !== 'fulfilled') {
      alert('Մուտք գործել չհաջողվեց, փորձեք նորից');
      return;
    }

    await AsyncStorage.multiSet([
      ['accessToken', payload.accessToken],
      ['expDate', payload.expDate.toString()],
      ['refreshToken', payload.refreshToken],
    ]);

    await dispatch(setAuth(payload));
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require('../assets/logo.png')} />
      </View>
      <View>
        <Input
          label="Մուտքանուն"
          value={state.userName}
          onChangeText={handleChange('userName')}
          leftIcon={<Icon name="user" size={24} color={theme.colors.primary} />}
        />
        <Input
          value={state.password}
          label="Գաղտնաբառ"
          secureTextEntry
          onChangeText={handleChange('password')}
          leftIcon={<Icon name="lock" size={24} color={theme.colors.primary} />}
        />
        <View>
          <Button
            disabled={!state.userName || !state.password}
            title="Մուտք գործել"
            onPress={handleSubmit}></Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-around',
    flex: 1,
    marginVertical: 30,
    marginHorizontal: 15,
  },
  logoContainer: {
    marginVertical: 10,
  },
  logo: {
    height: 100,
    resizeMode: 'contain',
  },
});
