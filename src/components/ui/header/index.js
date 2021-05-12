import React from 'react';
import {StyleSheet} from 'react-native';
import {View, Text} from 'react-native';

const Header = ({title}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
  },
});

export default Header;
