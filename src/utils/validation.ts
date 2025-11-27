import { toTypedSchema } from '@vee-validate/yup';
import type { AnyObject, ObjectSchema } from 'yup';

export const buildValidationSchema = <TValues extends AnyObject>(schema: ObjectSchema<TValues>) =>
  toTypedSchema(schema);

export const toErrorMessages = (message?: string | string[] | null) => {
  if (!message) {
    return [] as string[];
  }

  return Array.isArray(message) ? message : [message];
};
