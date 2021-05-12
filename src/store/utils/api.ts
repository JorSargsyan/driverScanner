import AsyncStorage from '@react-native-async-storage/async-storage';

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
