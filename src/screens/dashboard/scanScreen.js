import React, {useRef, useState, Fragment, useEffect, useCallback} from 'react';
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
import {useAndroidBackHandler} from 'react-navigation-backhandler';

import Icon from 'react-native-vector-icons/FontAwesome';

import {theme} from '../../../App';

import Spinner from 'react-native-loading-spinner-overlay';
import {Text, Button, Input, ListItem} from 'react-native-elements';
import Toast from 'react-native-toast-message';

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
  removeUnacceptedShipments,
  resetShipmentData,
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
      <ListItem.Title>Քաշ: {item.totalWeight} գր.</ListItem.Title>
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

const errorMessages = {
  shipment_not_found: 'Բեռնախումբը չի գտնվել',
  empty_shipment: 'Դատարկ բեռնախումբ',
  shipment_is_in_another_location:
    'Բեռնախումբը արդեն հանձնված է կամ գտնվում է այլ վայրում',
};

const ScanScreen = ({navigation, route}) => {
  const scannerRef = useRef();

  const dispatch = useDispatch();
  const [manualCode, setManualCode] = useState('');
  const shipmentsData = useSelector(selectShipments);
  const [isLoading, setIsLoading] = useState(false);
  const mode = route?.params?.mode;
  const scannedData = route.params?.scannedData
    ? JSON.parse(route.params?.scannedData)
    : '';
  const [possibleWarehouses, setPossibleWarehouses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [actualShipmentCode, setActualShipmentCode] = useState('');

  useAndroidBackHandler(() => {
    const hasUnAcceptedShipment =
      Object.values(shipmentsData).length &&
      Object.values(shipmentsData).find(i => !i.isCompleted);
    if (hasUnAcceptedShipment) {
      Alert.alert(
        'Վստահ եք՞',
        'Չպահպանված տվյալները հեռացվելու են',
        [
          {text: 'Լավ', onPress: deleteShipments},
          {text: 'Չեղարկել', onPress: () => false},
        ],
        {cancelable: true},
      );
      return true;
    }
    return false;
  });

  const resetScanner = () => {
    setTimeout(() => {
      scannerRef.current?.reactivate();
    }, 3000);
  };

  const deleteShipments = async () => {
    await dispatch(removeUnacceptedShipments());
    navigation.navigate('Shipment');
  };

  const onAcceptSuccess = useCallback(
    async e => {
      if (shipmentsData?.[e.data] && shipmentsData?.[e.data].isAccepted) {
        Alert.alert(
          '',
          'Բեռը արդեն հաստատված է',
          [{text: 'Լավ', onPress: resetScanner}],
          {cancelable: false},
        );
        return;
      }
      setIsLoading(true);
      const {meta, payload, error} = await dispatch(checkIsShipment(e.data));

      if (meta.requestStatus !== 'fulfilled') {
        if (error.data.key === 'shipment_not_found') {
          //Bundle Scanned
          if (Object.keys(shipmentsData)?.length) {
            if (
              !shipmentsData[e.data]?.scannedBundleIds?.find(i => i === e.data)
            ) {
              const actualBundle = shipmentsData[
                actualShipmentCode
              ]?.expectedBundles.find(i => i.trackingId === e.data);
              if (actualBundle) {
                dispatch(
                  scanBundle({
                    shipmentId: actualShipmentCode,
                    bundleId: e.data,
                  }),
                );

                Toast.show({
                  type: 'success',
                  text1: 'Պարկը Սկանավորված է',
                  visibilityTime: 3000,
                  position: 'bottom',
                });
              } else {
                let errorMessage = '';
                if (
                  shipmentsData[actualShipmentCode]?.scannedBundleIds.find(
                    item => item === e.data,
                  )
                ) {
                  errorMessage = 'Պարկը արդեն սկանավորված է';
                } else {
                  errorMessage = 'Պարկը չի պատկանում տվյալ բեռնախմբին';
                }

                Alert.alert(
                  '',
                  errorMessage,
                  [{text: 'Լավ', onPress: resetScanner}],
                  {cancelable: false},
                );
              }

              setIsLoading(false);
              setManualCode('');
              setManualModalVisible(false);
              resetScanner();
              return;
            } else {
              Alert.alert(
                '',
                'Ծանրոցը արդեն սկանավորված է ',
                [{text: 'Լավ', onPress: resetScanner}],
                {cancelable: false},
              );
              setIsLoading(false);
              return;
            }
          } else {
            Alert.alert(
              '',
              'Անհրաժեշտ է սկանավորել բեռը',
              [{text: 'Լավ', onPress: resetScanner}],
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
        if (e.data === actualShipmentCode) {
          setIsLoading(false);
          resetScanner();
          setManualCode('');
          setManualModalVisible(false);
          return;
        }

        if (
          Object.values(shipmentsData).length &&
          Object.values(shipmentsData).find(i => !i.isCompleted)
        ) {
          await dispatch(removeUnacceptedShipments());
        }
        dispatch(scanShipment(e.data));
        setActualShipmentCode(e.data);
        dispatch(setExpectedBundles({list: payload, shipmentId: e.data}));
        setIsLoading(false);
        resetScanner();
        setManualCode('');
        setManualModalVisible(false);
        Toast.show({
          type: 'success',
          text1: 'Բեռնախումբը Սկանավորված է',
          visibilityTime: 3000,
          position: 'bottom',
        });
        setIsLoading(false);
        resetScanner();
        return;
      } else {
        setIsLoading(false);

        Alert.alert(
          '',
          'Բեռը դատարկ է ',
          [{text: 'Լավ', onPress: resetScanner}],
          {
            cancelable: false,
          },
        );
      }
    },
    [actualShipmentCode, dispatch, shipmentsData],
  );

  const onDeliverSuccess = useCallback(
    async e => {
      setIsLoading(true);
      const {meta, payload, error} = await dispatch(
        checkPossibleLocations(e.data),
      );

      if (meta.requestStatus !== 'fulfilled') {
        setIsLoading(false);
        const message = errorMessages[error.data?.key] || error.data?.key;

        Alert.alert('', message, [{text: 'Լավ', onPress: resetScanner}], {
          cancelable: false,
        });
        return;
      }
      setActualShipmentCode(e.data);
      setPossibleWarehouses(payload);
      setModalVisible(true);

      setIsLoading(false);
    },
    [dispatch],
  );

  const onSuccess = useCallback(
    async barcodes => {
      if (mode === 'accept') {
        barcodes.forEach(item => {
          onAcceptSuccess({data: item});
        });
      } else {
        onDeliverSuccess({data: barcodes[0]});
      }
    },
    [mode, onAcceptSuccess, onDeliverSuccess],
  );

  const handlePressSubmit = async () => {
    setIsLoading(true);
    const {meta, error} = await dispatch(
      acceptShipment(shipmentsData[actualShipmentCode]?.scannedBundleIds),
    );

    if (meta.requestStatus !== 'fulfilled') {
      const message =
        error.data.key === 'please_scan_all_bundles'
          ? 'Խնդրում ենք սկանավորել բոլոր պարկերը'
          : error.data.key;
      Alert.alert('', message, [{text: 'Լավ', onPress: resetScanner}], {
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
          text: 'Լավ',
          onPress: async () => {
            resetScanner();
            dispatch(resetShipmentData());
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
    const {meta, payload, error} = await dispatch(
      deliveryShipment({
        shipmentTrackingId: actualShipmentCode,
        warehouseId: warehouseId,
      }),
    );
    if (meta.requestStatus !== 'fulfilled') {
      setIsLoading(false);
      Alert.alert('', error.data.key, [{text: 'Լավ', onPress: resetScanner}], {
        cancelable: false,
      });
      return;
    }
    setIsLoading(false);
    Alert.alert(
      '',
      `Հանձնված պարկերի քանակը - ${payload?.length}`,
      [
        {
          text: 'Լավ',
          onPress: async () => {
            resetScanner();
            await dispatch(getShipments());
            navigation.navigate('Shipment');
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  const handleNavigateScan = () => {
    let isShipment = !Object.keys(shipmentsData).length;
    navigation.navigate('Scanner', {mode, isShipment});
  };

  useEffect(() => {
    if (!scannedData?.barcodes?.length) {
      return;
    }
    const barcodes = scannedData.barcodes.map(i => i.value);

    onSuccess(barcodes);
    navigation.setParams({scannedData: null, mode});
  }, [mode, navigation, onSuccess, scannedData]);

  return (
    <KeyboardAvoidingView behavior="height">
      <SafeAreaView
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          ...styles.contentContainer,
          ...(shipmentsData?.[actualShipmentCode]?.expectedBundles
            ? styles.justifyFlexStart
            : styles.justifyCenter),
        }}>
        <Spinner visible={isLoading} />
        <Modal
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
            resetScanner();
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
        <View style={styles.container}>
          {!!shipmentsData?.[actualShipmentCode]?.expectedBundles?.length && (
            <View style={styles.headerContainer}>
              <Text style={styles.shipment}>
                Բեռնախումբ: {shipmentsData?.[actualShipmentCode]?.trackingId}
              </Text>
              <Counter
                length={
                  shipmentsData?.[actualShipmentCode]?.expectedBundles
                    ?.length || 0
                }
              />
            </View>
          )}

          {shipmentsData?.[actualShipmentCode]?.expectedBundles?.length ? (
            <View style={styles.flatList}>
              <Fragment>
                <Text style={styles.flatListTitle}>Պարկեր</Text>
                <FlatList
                  style={styles.flatList}
                  data={shipmentsData?.[actualShipmentCode]?.expectedBundles}
                  renderItem={({item}) => <OptionItem item={item} />}
                  keyExtractor={item => item.id}
                />
              </Fragment>
            </View>
          ) : (
            <>
              {!shipmentsData[actualShipmentCode]?.expectedBundles?.length &&
              shipmentsData[actualShipmentCode]?.scannedBundleIds?.length ? (
                <View style={styles.flatList}>
                  <View style={styles.noBundleContainer}>
                    <Text style={styles.noBundleText}>
                      Բոլոր պարկերը ընդունված են: Կարող եք հաստատել բեռնախումբը
                    </Text>
                  </View>
                </View>
              ) : null}
            </>
          )}
          <View>
            {!(
              shipmentsData?.[actualShipmentCode]?.expectedBundles?.length === 0
            ) && (
              <Fragment>
                <View style={styles.manualScanBtnContainer}>
                  <Button title={'Սկանավորել'} onPress={handleNavigateScan} />
                </View>

                <View style={styles.manualScanBtnContainer}>
                  <Button
                    labelStyle={styles.labelStyle}
                    enableShadow
                    title="Մուտքագրել կոդը"
                    onPress={() => setManualModalVisible(true)}
                  />
                </View>
              </Fragment>
            )}

            <Button
              disabled={
                !(
                  shipmentsData?.[actualShipmentCode]?.expectedBundles
                    ?.length === 0
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
              onPress={() => onSuccess([manualCode.toUpperCase()])}
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
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyFlexStart: {
    justifyContent: 'flex-start',
  },
  noBundleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatList: {height: 350, paddingBottom: 20},
  flatListTitle: {
    fontSize: 16,
    paddingBottom: 5,
    fontWeight: 'bold',
  },
  counterText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 19,
  },
  contentContainer: {
    height: Dimensions.get('screen').height,
    display: 'flex',
  },
  container: {
    marginTop: 40,
    marginHorizontal: 16,
    display: 'flex',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
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
