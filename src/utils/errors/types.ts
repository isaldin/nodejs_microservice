import { Error as MongooseError } from 'mongoose';

export interface IAppError extends Error {
  code: number;
  payload?: object;
}

export interface IValidationError extends IAppError {
  errors: {
    [path: string]: string;
  };
}
