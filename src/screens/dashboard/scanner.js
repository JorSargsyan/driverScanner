import React, {useRef, useEffect} from 'react';

import {Alert, Dimensions, SafeAreaView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {
  scanShipment,
  scanBundle,
  checkIsShipment,
  selectBundlesList,
  selectShipment,
  setExpectedBundles,
  selectExpectedBundlesList,
} from '../../store/slicers/scannedData';
import {loadingStateOn, loadingStateOff} from '../../store/slicers/app';

export default () => {
  return <SafeAreaView></SafeAreaView>;
};
