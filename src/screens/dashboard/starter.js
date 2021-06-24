import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, View, Text} from 'react-native-ui-lib';

const StarterScreen = ({navigation}) => {
  const handleAccept = () => {
    navigation.navigate('Dashboard', {mode: 'accept'});
  };

  const handleDeliver = () => {
    navigation.navigate('Dashboard', {mode: 'delivery'});
  };

  return (
    <View style={styles.container}>
      <Button style={styles.button} primaryColor onPress={handleAccept}>
        <Text white>Ընդունել</Text>
      </Button>
      <Button style={styles.button} primaryColor onPress={handleDeliver}>
        <Text white>Հանձնել</Text>
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
