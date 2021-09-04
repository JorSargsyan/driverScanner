import React, {useRef, useState, Fragment} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  Alert,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  View,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Icon from 'react-native-vector-icons/FontAwesome';

import {RNCamera} from 'react-native-camera';
import {theme} from '../../../App';

import Spinner from 'react-native-loading-spinner-overlay';
import {Text, Button, Input, ListItem} from 'react-native-elements';

import {
  selectShipments,
  checkIsShipment,
  scanShipment,
  scanBundle,
  setExpectedBundles,
  acceptShipment,
  checkPossibleLocations,
  deliveryShipment,
  setShipmentCompleted,
} from '../../store/slicers/scannedData';
import {getShipments} from '../../store/slicers/shipment';

const plusIcon = require('../../assets/icons/plus.png');

const OptionItem = ({item}) => {
  return (
    <ListItem key={item.id} bottomDivider>
      <ListItem.Content>
        <ListItem.Subtitle>Հետևման կոդ</ListItem.Subtitle>
        <ListItem.Title>{item.trackingId}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Content>
        <ListItem.Subtitle>Քաշ</ListItem.Subtitle>
        <ListItem.Title>{item.totalWeight}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
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

const ScanScreen = ({navigation, route}) => {
  const scannerRef = useRef();
  const dispatch = useDispatch();
  const [manualCode, setManualCode] = useState('');
  const shipmentsData = useSelector(selectShipments);
  const [isLoading, setIsLoading] = useState(false);
  const {mode} = route.params;
  const [possibleWarehouses, setPossibleWarehouses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [actualShipmentCode, setActualShipmentCode] = useState('');

  const resetScanner = () => {
    setTimeout(() => {
      scannerRef.current?.reactivate();
    }, 3000);
  };

  const onAcceptSuccess = async e => {
    if (shipmentsData?.[e.data] && shipmentsData?.[e.data].isAccepted) {
      Alert.alert(
        '',
        'Բեռը արդեն հաստատված է',
        [{text: 'OK', onPress: resetScanner}],
        {cancelable: false},
      );
      return;
    }
    setIsLoading(true);
    const {meta, payload, error} = await dispatch(checkIsShipment(e.data));

    if (meta.requestStatus !== 'fulfilled') {
      if (error.data.key === 'shipment_not_found') {
        //Bundle Scanned
        if (shipmentsData) {
          if (
            !shipmentsData[e.data]?.scannedBundleIds?.find(i => i === e.data)
          ) {
            dispatch(
              scanBundle({shipmentId: actualShipmentCode, bundleId: e.data}),
            );
            setIsLoading(false);
            resetScanner();
            setManualCode('');
            setManualModalVisible(false);
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
      if (
        Object.values(shipmentsData).length &&
        Object.values(shipmentsData).find(
          i => !i.isCompleted && i.scannedBundleIds?.length,
        )
      ) {
        Alert.alert(
          '',
          'Անհրաժեշտ է հաստատել ներկայիս բեռը',
          [{text: 'OK', onPress: resetScanner}],
          {cancelable: false},
        );
        setIsLoading(false);
        resetScanner();
        return;
      }
      dispatch(scanShipment(e.data));
      setActualShipmentCode(e.data);
      dispatch(setExpectedBundles({list: payload, shipmentId: e.data}));
      setIsLoading(false);
      resetScanner();
      setManualCode('');
      setManualModalVisible(false);
    } else {
      setIsLoading(false);

      Alert.alert('', 'Բեռը դատարկ է ', [{text: 'OK', onPress: resetScanner}], {
        cancelable: false,
      });
    }
  };

  const onDeliverSuccess = async e => {
    setIsLoading(true);
    const {meta, payload} = await dispatch(checkPossibleLocations(e.data));

    if (meta.requestStatus !== 'fulfilled') {
      setIsLoading(false);
      const message = 'empty_shipment' ? 'Դատարկ բեռնախումբ' : 'Համակարգի սխալ';
      Alert.alert('', message, [{text: 'OK', onPress: resetScanner}], {
        cancelable: false,
      });
      return;
    }
    setActualShipmentCode(e.data);
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
    const {meta, error} = await dispatch(
      acceptShipment(shipmentsData[actualShipmentCode]?.scannedBundleIds),
    );

    if (meta.requestStatus !== 'fulfilled') {
      const message =
        error.data.key === 'please_scan_all_bundles'
          ? 'Խնդրում ենք սկանավորել բոլոր պարկերը'
          : 'Համակարգի սխալ';
      Alert.alert('', message, [{text: 'OK', onPress: resetScanner}], {
        cancelable: false,
      });
      setIsLoading(false);
      resetScanner();
      return;
    }

    setIsLoading(false);
    dispatch(setShipmentCompleted(actualShipmentCode));
    Alert.alert(
      '',
      'Բեռը ընդունված է',
      [
        {
          text: 'OK',
          onPress: async () => {
            resetScanner();
            await dispatch(getShipments());
            navigation.navigate('Shipment');
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
        shipmentTrackingId: actualShipmentCode,
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
      `Հանձնված բեռների քանակը - ${payload?.length}`,
      [
        {
          text: 'OK',
          onPress: () => {
            resetScanner();
            navigation.navigate('Shipment');
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  return (
    <KeyboardAvoidingView behavior="height">
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
            {!!shipmentsData?.[actualShipmentCode]?.expectedBundles?.length && (
              <>
                <Text style={styles.shipment}>
                  {shipmentsData?.[actualShipmentCode]?.trackingId}
                </Text>
                <Counter
                  length={
                    shipmentsData?.[actualShipmentCode]?.expectedBundles
                      ?.length || 0
                  }
                />
              </>
            )}
          </View>
          <View style={styles.flatList}>
            {shipmentsData?.[actualShipmentCode]?.expectedBundles?.length ? (
              <FlatList
                style={styles.flatList}
                data={shipmentsData?.[actualShipmentCode]?.expectedBundles}
                renderItem={({item}) => <OptionItem item={item} />}
                keyExtractor={item => item.id}
              />
            ) : (
              <>
                {!shipmentsData[actualShipmentCode]?.expectedBundles?.length &&
                shipmentsData[actualShipmentCode]?.scannedBundleIds?.length ? (
                  <View style={styles.noBundleContainer}>
                    <Text style={styles.noBundleText}>
                      Բոլոր պարկերը ընդունված են: Կարող եք հաստատել բեռնախումբը
                    </Text>
                  </View>
                ) : null}
              </>
            )}
          </View>
          <View style={styles.manualScanBtnContainer}>
            <Button
              labelStyle={styles.labelStyle}
              enableShadow
              title="Մուտքագրել կոդը"
              onPress={() => setManualModalVisible(true)}
            />
          </View>

          <Button
            disabled={
              !(
                shipmentsData?.[actualShipmentCode]?.expectedBundles?.length ===
                0
              )
            }
            title="Հաստատել"
            labelStyle={styles.labelStyle}
            enableShadow
            iconSource={plusIcon}
            iconStyle={styles.iconStyle}
            onPress={handlePressSubmit}
          />
        </View>
      </SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        style={styles.modalContainer}
        visible={manualModalVisible}
        onRequestClose={() => {
          setManualModalVisible(false);
        }}>
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setManualModalVisible(false);
            }}>
            <Text style={styles.addButtonText}>
              <Icon name="close" size={40} color={theme.colors.primary} />
            </Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            Մուտքագրեք բեռնախմբի կամ պարկի հետևման կոդը
          </Text>
          <View style={styles.footer}>
            <Input
              label="Բեռնախումբ/Պարկ"
              value={manualCode}
              onChangeText={text => setManualCode(text.toUpperCase())}
            />
            <Button
              title="Սկանավորել"
              labelStyle={styles.labelStyle}
              enableShadow
              iconSource={plusIcon}
              iconStyle={styles.iconStyle}
              onPress={() => onSuccess({data: manualCode.toUpperCase()})}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
  },
  modal: {
    height: '100%',
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  manualScanBtnContainer: {
    marginBottom: 10,
  },
  addButton: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  modalTitle: {
    paddingTop: '40%',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 40,
  },
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

export default ScanScreen;
