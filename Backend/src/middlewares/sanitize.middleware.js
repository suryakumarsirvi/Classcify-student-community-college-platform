import mongoSanitize from 'express-mongo-sanitize';

const sanitize = () => mongoSanitize({
  replaceWith: '_'
});

export default sanitize;
