import {isRejected} from '@reduxjs/toolkit';
import store from '..';
import {setIsExpired} from '../slicers/app';

const errorHandling = () => next => async action => {
  if (isRejected(action)) {
    if (action.error.status === 401) {
      store.dispatch(setIsExpired(true));
    }
  }
  return next(action);
};

export default errorHandling;
