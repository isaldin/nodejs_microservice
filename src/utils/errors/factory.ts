import { IValidationError } from './types';

interface IBuildValidationErrorInput {
  path: string;
  reason: string;
}
const buildValidationError = (
  input: IBuildValidationErrorInput
): IValidationError => ({
  code: 422,
  message: 'Validation error',
  errors: {
    [input.path]: input.reason
  }
});

export { buildValidationError };
