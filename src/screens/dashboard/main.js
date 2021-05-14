import React, {useRef, useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  Alert,
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

const Counter = ({length}) => {
  return (
    <View style={styles.counter}>
      <Text style={styles.counterText}>{length}</Text>
    </View>
  );
};

const Main = () => {
  const scannerRef = useRef();
  const dispatch = useDispatch();
  const shipment = useSelector(selectShipment);
  const expectedBundlesList = useSelector(selectExpectedBundlesList);
  const bundleIds = useSelector(selectScannedBundleIds);
  const [isLoading, setIsLoading] = useState(false);

  const resetScanner = () => {
    setTimeout(() => {
      scannerRef.current?.reactivate();
    }, 3000);
  };

  const onSuccess = async e => {
    if (shipment && shipment === e.data) {
      Alert.alert(
        '',
        'Shipment has already been scanned',
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
              'Bundle has already been scanned',
              [{text: 'OK', onPress: resetScanner}],
              {cancelable: false},
            );
            setIsLoading(false);
            return;
          }
        } else {
          Alert.alert(
            '',
            'First scan Shipment code!',
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

      Alert.alert(
        '',
        'Shipment is empty',
        [{text: 'OK', onPress: resetScanner}],
        {cancelable: false},
      );
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
      'Shipment is accepted',
      [{text: 'OK', onPress: resetScanner}],
      {cancelable: false},
    );
  };

  return (
    <SafeAreaView>
      <Spinner visible={isLoading} />
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
    backgroundColor: 'lightgray',
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
});

export default Main;
