import React, {useEffect} from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getUserByToken, selectConsumer} from '../../store/slicers/scannedData';
import {signOut} from '../../store/slicers/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button, Text} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {theme} from '../../../App';

const StarterScreen = ({navigation}) => {
  const consumer = useSelector(selectConsumer);

  const handleAccept = () => {
    navigation.navigate('Scan', {mode: 'accept'});
  };

  const handleDeliver = () => {
    navigation.navigate('Scan', {mode: 'delivery'});
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutContainer} onPress={handleLogout}>
        <Text style={styles.logoutText}>Դուրս գալ</Text>
        <Icon size={24} name="sign-out" color={theme.colors.secondary} />
      </TouchableOpacity>
      {consumer?.roleId !== 30 ? (
        <React.Fragment>
          <Text>
            Սխալ մուտքային տվյալներ, խնդրում ենք մուտք գործել Վարորդի տվյալներով
          </Text>
        </React.Fragment>
      ) : (
        <View style={styles.buttonsGroup}>
          <Button
            containerStyle={styles.button}
            title="Ընդունել Բեռնախումբ"
            onPress={handleAccept}
          />
          <Button
            containerStyle={styles.button}
            title="Հանձնել Բեռնախումբ"
            primaryColor
            onPress={handleDeliver}
          />
        </View>
      )}
    </View>
  );
};

export default StarterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {flex: 1},
  buttonsGroup: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  logoutContainer: {
    paddingVertical: 30,
    paddingHorizontal: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  logoutText: {
    marginRight: 10,
  },
  button: {
    marginVertical: 10,
  },
});
