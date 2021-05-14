import React, {useReducer} from 'react';
import {StyleSheet} from 'react-native';
import View from 'react-native-ui-lib/view';
import TextField from 'react-native-ui-lib/textField';
import Text from 'react-native-ui-lib/text';
import Button from 'react-native-ui-lib/button';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../store';
import {authenticate, setAuth} from '../store/slicers/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    <View flex centerV style={styles.container}>
      <TextField
        placeholder="Մուտքանուն"
        floatingPlaceholder
        floatOnFocus
        value={state.userName}
        onChangeText={handleChange('userName')}
      />
      <TextField
        bg-primaryColor
        floatOnFocus
        floatingPlaceholder
        placeholder="Գաղտնաբառ"
        value={state.password}
        secureTextEntry
        onChangeText={handleChange('password')}
      />
      <View>
        <Button
          disabled={!state.userName || !state.password}
          primaryColor
          onPress={handleSubmit}>
          <Text white>Մուտք գործել</Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 30,
    marginHorizontal: 15,
  },
});
