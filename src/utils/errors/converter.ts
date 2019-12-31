// tslint:disable-next-line: no-implicit-dependencies
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

interface IAppError {
  code: number;
  message: string;
  payload?: object;
}

interface IValidationError extends IAppError {
  errors: {
    [path: string]: MongooseError.ValidatorError | MongooseError.CastError;
  };
}

const unknownError = (payload?: object): IAppError => ({
  code: 500,
  message: 'Unknown error',
  payload: {
    error: payload
  }
});

const convertMongoError = (mongoError: MongoError): IAppError => {
  if (mongoError.code === 11000) {
    return {
      code: 422,
      message: 'Duplicate entity'
    };
  }

  return {
    code: 500,
    message: 'Something wrong with db',
    payload: {
      errmsg: mongoError.errmsg
    }
  };
};

const convertMongooseError = (error: MongooseError): IAppError => {
  if (error instanceof MongooseError.ValidationError) {
    const validationError: IValidationError = {
      code: 422,
      errors: error.errors,
      message: 'Validation error'
    };
    return validationError;
  }

  return {
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
  } else {
    return unknownError(errorObject);
  }
};

export default convertError;
