import ApiError from '../utils/ApiError.js';

const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {};
    if (schema.body) dataToValidate.body = req.body;
    if (schema.query) dataToValidate.query = req.query;
    if (schema.params) dataToValidate.params = req.params;

    const validated = schema.safeParse(dataToValidate);

    if (!validated.success) {
      const errorMessages = validated.error.errors.map(
        (issue) => `${issue.path.join('.').replace(/^(body|query|params)\./, '')}: ${issue.message}`
      );
      throw new ApiError(400, 'Validation failed', errorMessages);
    }

    if (schema.body && validated.data.body) req.body = validated.data.body;
    if (schema.query && validated.data.query) req.query = validated.data.query;
    if (schema.params && validated.data.params) req.params = validated.data.params;

    next();
  } catch (error) {
    next(error);
  }
};

export default validate;
