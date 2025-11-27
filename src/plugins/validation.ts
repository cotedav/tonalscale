import { configure } from 'vee-validate';

const setupValidation = () => {
  configure({
    validateOnBlur: true,
    validateOnChange: true,
    validateOnInput: false,
    validateOnModelUpdate: true,
  });
};

export default setupValidation;
