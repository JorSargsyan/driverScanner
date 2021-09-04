import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, FlatList} from 'react-native';
import {SpeedDial} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';
import {selectShipments, getShipments} from '../../store/slicers/shipment';
import {getUserByToken} from '../../store/slicers/scannedData';
import HeaderDS from '../../components/ui/header';
import {theme} from '../../../App';
import Item from '../../components/shared/ListItem';

const EmptyComponent = () => {
  return (
    <Text style={styles.emptyText}>
      Դուք չունեք ընդունված բեռնախմբեր: Բեռնախումբ ընդունելու համար սեղմեք
      ներքևի աջ կոճակը:
    </Text>
  );
};

const Shipment = ({navigation}) => {
  const dispatch = useDispatch();
  const shipments = useSelector(selectShipments);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(getUserByToken());
    dispatch(getShipments());
  }, [dispatch]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await dispatch(getShipments());
    setIsLoading(false);
  };

  const handlePressDrawerIcon = () => {
    navigation.toggleDrawer();
  };

  const handleAccept = () => {
    navigation.navigate('Scan', {mode: 'accept'});
  };

  const handleDeliver = () => {
    navigation.navigate('Scan', {mode: 'delivery'});
  };

  return (
    <>
      <HeaderDS
        title="Բեռնախմբեր"
        left={{icon: 'menu', onPress: handlePressDrawerIcon}}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Ընդունված Բեռնախմբեր</Text>
        <SafeAreaView style={styles.safeArea}>
          <FlatList
            data={shipments?.data}
            renderItem={({item}) => <Item data={item} />}
            keyExtractor={item => item.id}
            refreshing={isLoading}
            onRefresh={handleRefresh}
            ListEmptyComponent={<EmptyComponent />}
          />
        </SafeAreaView>
      </View>
      <SpeedDial
        isOpen={open}
        icon={{
          name: 'edit',
          color: '#fff',
        }}
        openIcon={{name: 'close', color: '#fff'}}
        color={theme.colors.primary}
        onOpen={() => setOpen(!open)}
        onClose={() => setOpen(!open)}>
        <SpeedDial.Action
          icon={{name: 'add', color: '#fff'}}
          color={theme.colors.primary}
          title="Ընդունել Բեռնախումբ"
          onPress={handleAccept}
        />
        <SpeedDial.Action
          icon={{name: 'remove', color: '#fff'}}
          color={theme.colors.primary}
          title="Հանձնել Բեռնախումբ"
          onPress={handleDeliver}
        />
      </SpeedDial>
    </>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 18,
  },
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
