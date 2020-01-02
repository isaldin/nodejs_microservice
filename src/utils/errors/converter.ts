// tslint:disable-next-line: no-implicit-dependencies
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { assoc, last, propOr, reduce, toPairs } from 'ramda';

import { IAppError, IValidationError } from './types';

const unknownError = (payload?: object): IAppError => ({
  name: 'Unknown error',
  code: 500,
  message: 'Unknown error',
  payload: {
    error: payload
  }
});

const convertMongoError = (mongoError: MongoError): IAppError => {
  if (mongoError.code === 11000) {
    return {
      name: 'MongoError',
      code: 422,
      message: 'Duplicate entity'
    };
  }

  return {
    name: 'MongoError',
    code: 500,
    message: 'Something wrong with db',
    payload: {
      errmsg: mongoError.errmsg
    }
  };
};

const convertMongooseError = (error: MongooseError): IAppError => {
  if (error instanceof MongooseError.ValidationError) {
    const errors = reduce(
      (acc, item) => assoc(item[0], propOr('', 'kind', last(item)), acc),
      {},
      toPairs(error.errors)
    );

    const validationError: IValidationError = {
      name: 'Validation error',
      code: 422,
      errors,
      message: 'Validation error'
    };
    return validationError;
  }

  return {
    name: 'MongooseError',
    code: 500,
    message: error.message,
    payload: {
      name: error.name,
      stack: error.stack
    }
  };
};

const convertError = (errorObject: Error | any): IAppError => {
  if (errorObject instanceof MongoError) {
    return convertMongoError(errorObject);
  } else if (errorObject instanceof MongooseError) {
    return convertMongooseError(errorObject);
  } else if (errorObject as IAppError) {
    return errorObject;
  } else {
    return unknownError(errorObject);
  }
};

export default convertError;
