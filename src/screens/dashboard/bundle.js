import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, FlatList} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {getBundles, selectBundles} from '../../store/slicers/shipment';
import HeaderDS from '../../components/ui/header';
import Item from '../../components/shared/ListItem';

const Shipment = ({navigation}) => {
  const dispatch = useDispatch();
  const shipments = useSelector(selectBundles);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(getBundles());
  }, [dispatch]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await dispatch(getBundles());
    setIsLoading(false);
  };

  const handlePressDrawerIcon = () => {
    navigation.toggleDrawer();
  };

  return (
    <>
      <HeaderDS
        title="Պարկեր"
        left={{icon: 'menu', onPress: handlePressDrawerIcon}}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Ընդունված Պարկեր</Text>
        <SafeAreaView style={styles.safeArea}>
          <FlatList
            data={shipments?.data}
            renderItem={({item}) => <Item data={item} />}
            keyExtractor={item => item.id}
            refreshing={isLoading}
            onRefresh={handleRefresh}
          />
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
  },
  safeArea: {
    marginTop: 30,
  },
});

export default Shipment;
