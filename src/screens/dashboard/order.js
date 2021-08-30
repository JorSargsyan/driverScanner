import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, FlatList} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {selectOrders, getOrders} from '../../store/slicers/shipment';
import HeaderDS from '../../components/ui/header';
import Item from '../../components/shared/ListItem';

const Shipment = ({navigation}) => {
  const dispatch = useDispatch();
  const shipments = useSelector(selectOrders);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await dispatch(getOrders());
    setIsLoading(false);
  };

  const handlePressDrawerIcon = () => {
    navigation.toggleDrawer();
  };

  return (
    <>
      <HeaderDS
        title="Առաքանիներ"
        left={{icon: 'menu', onPress: handlePressDrawerIcon}}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Ընդունված Առաքանիներ</Text>
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
    marginHorizontal: 10,
    marginTop: 30,
  },
  title: {
    fontSize: 18,
  },
  safeArea: {
    marginTop: 30,
  },
});

export default Shipment;
