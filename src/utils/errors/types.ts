import { Error as MongooseError } from 'mongoose';

export interface IAppError {
  code: number;
  message: string;
  payload?: object;
}

export interface IValidationError extends IAppError {
  errors: {
    [path: string]: string;
  };
}
