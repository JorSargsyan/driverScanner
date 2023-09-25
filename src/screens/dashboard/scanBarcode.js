import React, {useEffect, useState} from 'react';
import AnylineOCR from 'anyline-ocr-react-native-module';
import {useSelector} from 'react-redux';
import {
  BarcodeBundleConfig,
  BarcodeShipmentConfig,
} from '../../../config/barcode';
import {useNavigation, useRoute} from '@react-navigation/native';

import {
  DeviceEventEmitter,
  LayoutAnimation,
  PermissionsAndroid,
} from 'react-native';
import {selectScanMode} from '../../store/slicers/app';

const permissionMessages = {
  title: 'Anyline Camera Permissions',
  message: 'Allow Anyline to access your camera?',
};

const AnylineBarcodeScanner = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const scannerType = 'BARCODE';
  const isShipment = route?.params?.isShipment;
  const openAnyline = async type => {
    try {
      const result = await AnylineOCR.setupPromise(
        JSON.stringify(
          isShipment ? BarcodeShipmentConfig : BarcodeBundleConfig,
        ),
        'scan',
      );
      LayoutAnimation.easeInEaseOut();

      navigation.navigate('Scan', {scannedData: result || []});
    } catch (error) {
      if (error.message !== 'Canceled') {
        console.log(error.message);
      } else {
        navigation.navigate('Scan');
      }
    }
  };

  const updateAnyline = async type => {
    const onSessionConnect = event => {
      console.log(event.progress, 'SessionConnect');
    };
    DeviceEventEmitter.addListener(
      'ota_progress_update_event',
      onSessionConnect,
    );
    openAnyline(type);
  };

  const requestCameraPermission = async type => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        permissionMessages,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        updateAnyline(type);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const hasCameraPermission = async () => {
    try {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
    } catch (err) {
      console.warn(err, 'PERMISSION CHECK');
    }
  };

  const checkCameraPermissionAndOpen = type => {
    hasCameraPermission().then(hasCameraPerm => {
      if (hasCameraPerm) {
        updateAnyline(type);
      } else {
        requestCameraPermission(type);
      }
    });
  };

  useEffect(() => {
    checkCameraPermissionAndOpen(scannerType);
  }, []);

  return <></>;
};

export default AnylineBarcodeScanner;
