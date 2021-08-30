import React from 'react';
import {Header} from 'react-native-elements';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {signOut} from '../../../store/slicers/app';
import {Alert} from 'react-native';

const HeaderDS = ({title, left}) => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    Alert.alert('Ուշադրություն', 'Ցանկանում եք դուրս գալ համակարգից:', [
      {
        text: 'Ոչ',
      },
      {
        text: 'Այո',
        onPress: async () => {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          dispatch(signOut());
        },
      },
    ]);
  };

  return (
    <Header
      leftComponent={
        left
          ? {icon: left.icon, color: '#fff', onPress: left.onPress}
          : undefined
      }
      centerComponent={{text: title, style: {color: '#fff', fontSize: 18}}}
      rightComponent={{
        icon: 'logout',
        color: '#fff',
        title: 'Դուրս գալ',
        onPress: handleLogout,
      }}
    />
  );
};

export default HeaderDS;
