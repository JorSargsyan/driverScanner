import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {Button, View, Text} from 'react-native-ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import {getUserByToken, selectConsumer} from '../../store/slicers/scannedData';
import {signOut} from '../../store/slicers/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StarterScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const consumer = useSelector(selectConsumer);

  useEffect(() => {
    dispatch(getUserByToken());
  }, [dispatch]);

  const handleAccept = () => {
    navigation.navigate('Dashboard', {mode: 'accept'});
  };

  const handleDeliver = () => {
    navigation.navigate('Dashboard', {mode: 'delivery'});
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    dispatch(signOut());
  };

  return (
    <View style={styles.container}>
      {consumer?.roleId !== 30 ? (
        <React.Fragment>
          <Text>
            Սխալ մուտքային տվյալներ,խնդրում ենք մուտք գործել Վարորդի տվյալներով
          </Text>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Button style={styles.button} primaryColor onPress={handleAccept}>
            <Text white>Ընդունել</Text>
          </Button>
          <Button style={styles.button} primaryColor onPress={handleDeliver}>
            <Text white>Հանձնել</Text>
          </Button>
        </React.Fragment>
      )}

      <Button style={styles.button} primaryColor onPress={handleLogout}>
        <Text white>Դուրս գալ</Text>
      </Button>
    </View>
  );
};

export default StarterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  button: {
    marginBottom: 30,
  },
});
