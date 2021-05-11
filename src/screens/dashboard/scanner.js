import React, {useRef} from 'react';

import {Alert} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';

export default () => {
  const scannerRef = useRef();
  const onSuccess = e => {
    Alert.alert('Scanned succesfully', `Code is ${e.data}`, [
      {
        cancelable: false,
      },
      {text: 'OK', onPress: () => scannerRef.current.reactivate()},
    ]);
  };
  return (
    <QRCodeScanner
      ref={scannerRef}
      showMarker
      onRead={onSuccess}
      flashMode={RNCamera.Constants.FlashMode.auto}
    />
  );
};
