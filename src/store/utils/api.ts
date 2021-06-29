import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import store from '..';
import {ERRORS} from '../../assets/contants';
import {refreshToken} from '../slicers/app';

export const api = ({
  method,
  url,
  body,
  headers,
}: {
  method: string;
  url: string;
  body?: any;
  headers?: any;
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: (await AsyncStorage.getItem('accessToken')) || '',
          ...headers,
        },
      });

      console.log(body);

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        resolve(result);
      } else {
        try {
          const result = await response.json();
          if (result.key === 'expired_access_token') {
            console.log('refresh token moment');
            store.dispatch(
              refreshToken({
                accessToken: (await AsyncStorage.getItem('accessToken')) || '',
                refreshToken:
                  (await AsyncStorage.getItem('refreshToken')) || '',
              }),
            );
          }
          reject({
            status: response.status,
            data: result,
          });
        } catch (err) {
          reject({
            status: response.status,
            data: err,
          });
        }
      }
    } catch (err) {
      reject(err);
    }
  });
};
