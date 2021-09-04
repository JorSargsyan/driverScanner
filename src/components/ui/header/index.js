import React from 'react';
import {Header} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {signOut} from '../../../store/slicers/app';
import {Alert, Text, View, StyleSheet} from 'react-native';
import {selectConsumer} from '../../../store/slicers/scannedData';
import {theme} from '../../../../App';

const HeaderDS = ({title, left}) => {
  const consumerData = useSelector(selectConsumer);
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
    <View>
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
      <View style={styles.consumerData}>
        <Text>
          {consumerData?.firstName} {consumerData?.lastName} /{' '}
          {consumerData?.tabNumber}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  consumerData: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fa47169e',
  },
});

export default HeaderDS;
