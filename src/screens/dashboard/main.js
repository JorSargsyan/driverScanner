import React, {useRef, useState, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  Alert,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Button, View, Text} from 'react-native-ui-lib';
import {useSelector, useDispatch} from 'react-redux';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import Spinner from 'react-native-loading-spinner-overlay';

import {
  selectShipment,
  selectExpectedBundlesList,
  checkIsShipment,
  scanShipment,
  scanBundle,
  setExpectedBundles,
  acceptShipment,
  selectScannedBundleIds,
  checkPossibleLocations,
  deliveryShipment,
  getUserByToken,
} from '../../store/slicers/scannedData';

const plusIcon = require('../../assets/icons/plus.png');

const OptionItem = ({item}) => {
  return (
    <View style={styles.optionContainer}>
      <View style={styles.optionTextWrapper}>
        <Text style={styles.optionText}>Tracking Code: </Text>
        <Text style={styles.optionTextBold}>{item.trackingId}</Text>
      </View>
      <View style={styles.optionTextWrapper}>
        <Text style={styles.optionText}>Total Weigth: </Text>
        <Text style={styles.optionTextBold}>{item.totalWeight}</Text>
      </View>
    </View>
  );
};

const WarehouseOptionItem = ({item, onPress}) => {
  return (
    <TouchableOpacity onPress={() => onPress(item.id)}>
      <View style={styles.whOptionContainer}>
        <View style={styles.optionTextWrapper}>
          <Text style={styles.optionText}>{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Counter = ({length}) => {
  return (
    <View style={styles.counter}>
      <Text style={styles.counterText}>{length}</Text>
    </View>
  );
};

const Main = ({navigation, route}) => {
  const scannerRef = useRef();
  const dispatch = useDispatch();
  const shipment = useSelector(selectShipment);
  const expectedBundlesList = useSelector(selectExpectedBundlesList);
  const bundleIds = useSelector(selectScannedBundleIds);
  const [isLoading, setIsLoading] = useState(false);
  const {mode} = route.params;
  const [possibleWarehouses, setPossibleWarehouses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState('');

  const resetScanner = () => {
    setTimeout(() => {
      scannerRef.current?.reactivate();
    }, 3000);
  };

  const onAcceptSuccess = async e => {
    if (shipment && shipment === e.data) {
      Alert.alert(
        '',
        'Բեռը արդեն սկանավորված է',
        [{text: 'OK', onPress: resetScanner}],
        {cancelable: false},
      );
      return;
    }
    setIsLoading(true);
    const {meta, payload, error} = await dispatch(checkIsShipment(e.data));

    if (meta.requestStatus !== 'fulfilled') {
      if (error.data.key === 'shipment_not_found') {
        if (shipment) {
          if (!bundleIds?.find(i => i === e.data)) {
            dispatch(scanBundle(e.data));
            setIsLoading(false);
            resetScanner();
            return;
          } else {
            Alert.alert(
              '',
              'Ծանրոցը արդեն սկանավորված է ',
              [{text: 'OK', onPress: resetScanner}],
              {cancelable: false},
            );
            setIsLoading(false);
            return;
          }
        } else {
          Alert.alert(
            '',
            'Անհրաժեշտ է սկանավորել բեռը',
            [{text: 'OK', onPress: resetScanner}],
            {cancelable: false},
          );
          setIsLoading(false);
          return;
        }
      }
      setIsLoading(false);
      resetScanner();
      return;
    }

    if (payload.length) {
      dispatch(scanShipment(e.data));
      dispatch(setExpectedBundles(payload));
      setIsLoading(false);
      resetScanner();
    } else {
      setIsLoading(false);

      Alert.alert('', 'Բեռը դատարկ է ', [{text: 'OK', onPress: resetScanner}], {
        cancelable: false,
      });
    }
  };

  const onDeliverSuccess = async e => {
    setIsLoading(true);
    setSelectedShipment(e.data);
    const {meta, payload} = await dispatch(checkPossibleLocations(e.data));

    if (meta.requestStatus !== 'fulfilled') {
      setIsLoading(false);
      Alert.alert('', 'Համակարգի սխալ', [{text: 'OK', onPress: resetScanner}], {
        cancelable: false,
      });
      return;
    }

    // console.log(payload);
    setPossibleWarehouses(payload);
    setModalVisible(true);

    setIsLoading(false);
  };

  const onSuccess = async e => {
    if (mode === 'accept') {
      onAcceptSuccess(e);
    } else {
      onDeliverSuccess(e);
    }
  };

  const handlePressSubmit = async () => {
    setIsLoading(true);
    const {meta} = await dispatch(acceptShipment(bundleIds));

    if (meta.requestStatus !== 'fulfilled') {
      return;
    }
    setIsLoading(false);

    Alert.alert(
      '',
      'Բեռը ընդունված է',
      [
        {
          text: 'OK',
          onPress: () => {
            resetScanner();
            navigation.navigate('StarterPage');
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleSelectWarehouse = async warehouseId => {
    setModalVisible(false);
    setIsLoading(true);
    const {meta, payload} = await dispatch(
      deliveryShipment({
        shipmentTrackingId: selectedShipment,
        warehouseId: warehouseId,
      }),
    );
    if (meta.requestStatus !== 'fulfilled') {
      setIsLoading(false);
      Alert.alert('', 'Համակարգի սխալ', [{text: 'OK', onPress: resetScanner}], {
        cancelable: false,
      });
      return;
    }
    setIsLoading(false);
    Alert.alert(
      '',
      `Հանձնված բեռների քանակը - ${payload.bundlesCount}`,
      [
        {
          text: 'OK',
          onPress: () => {
            resetScanner();
            navigation.navigate('StarterPage');
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  return (
    <SafeAreaView>
      <Spinner visible={isLoading} />
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <ScrollView style={styles.modalView}>
          {possibleWarehouses?.map(item => {
            return (
              <WarehouseOptionItem
                key={item.id}
                onPress={handleSelectWarehouse}
                item={item}
              />
            );
          })}
        </ScrollView>
      </Modal>
      <View style={styles.cameraContainer}>
        <QRCodeScanner
          ref={scannerRef}
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.auto}
        />
      </View>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {!!shipment && (
            <>
              <Text style={styles.shipment}>{shipment}</Text>
              <Counter length={expectedBundlesList?.length || 0} />
            </>
          )}
        </View>
        <View style={styles.flatList}>
          {expectedBundlesList.length ? (
            <FlatList
              style={styles.flatList}
              data={expectedBundlesList}
              renderItem={({item}) => <OptionItem item={item} />}
              keyExtractor={item => item.id}
            />
          ) : (
            <>
              {!!shipment && (
                <View style={styles.noBundleContainer}>
                  <Text style={styles.noBundleText}>
                    All bundles are scanned
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        <Button
          disabled={!(expectedBundlesList.length === 0 && shipment)}
          label="Հաստատել"
          labelStyle={styles.labelStyle}
          enableShadow
          iconSource={plusIcon}
          iconStyle={styles.iconStyle}
          onPress={handlePressSubmit}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  counter: {
    backgroundColor: 'red',
    height: 30,
    width: 30,
    borderRadius: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBundleContainer: {
    alignItems: 'center',
  },
  noBundleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatList: {height: 200, paddingBottom: 20},
  counterText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 19,
  },
  cameraContainer: {
    height: Dimensions.get('screen').height / 2,
    overflow: 'hidden',
  },
  container: {
    marginTop: 10,
    marginHorizontal: 16,
    height: Dimensions.get('screen').height / 2,
  },
  labelStyle: {
    fontWeight: '600',
  },
  iconStyle: {
    height: 20,
    width: 20,
  },
  optionContainer: {
    backgroundColor: '#e3e0e0',
    marginBottom: 5,
    shadowColor: 'gray',
    elevation: 2,
    padding: 10,
  },
  whOptionContainer: {
    backgroundColor: '#e3e0e0',
    marginBottom: 5,
    shadowColor: 'gray',
    elevation: 2,
    padding: 10,
  },
  optionText: {
    fontSize: 16,
    color: 'black',
  },
  optionTextBold: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shipment: {
    color: 'black',
    fontSize: 20,
    marginBottom: 10,
  },
  optionTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  modalView: {
    marginHorizontal: 10,
    marginVertical: 30,
  },
});

export default Main;
