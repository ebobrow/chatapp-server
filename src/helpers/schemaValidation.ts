import Joi, { object, ObjectSchema } from 'joi';

interface CustomError {
  joiErr: string;
  message: string;
}

interface errors {
  message: string;
  target?: string | undefined;
}

const errorMessages: Array<CustomError> = [
  {
    joiErr: '"name" must only contain alpha-numeric characters',
    message: 'Invalid characters in name'
  },
  {
    joiErr: '"name" length must be less than or equal to 50 characters long',
    message: 'Name must be less than 50 characters'
  },
  {
    joiErr: '"passwordVerify" must be [ref:password]',
    message: 'Passwords do not match'
  },
  {
    joiErr: '"newPasswordVerify" must be [ref:newPassword]',
    message: 'Passwords do not match'
  }
];

export const registerSchema = object({
  name: Joi.string().alphanum().max(50).required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  passwordVerify: Joi.ref('password')
});

export const loginSchema = object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

export const changePasswordSchema = object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  newPasswordVerify: Joi.ref('newPassword')
});

export const validateSchema = (schema: ObjectSchema, obj: object) => {
  const { error } = schema.validate(obj, { abortEarly: false });

  if (!error) return null;

  let messages: Array<errors> = [];

  error.details.forEach(err => {
    const message =
      errorMessages.find(msg => msg.joiErr === err.message)?.message ||
      err.message;
    messages.push({ message, target: err.context?.label });
  });

  return messages;
};
