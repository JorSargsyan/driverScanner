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
          ...headers,
        },
      });

      if (response.ok) {
        resolve(await response.json());
      } else {
        reject(response.json());
      }
    } catch (err) {
      reject(err);
    }
  });
};
