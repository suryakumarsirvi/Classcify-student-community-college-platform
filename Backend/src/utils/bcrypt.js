import bcrypt from 'bcryptjs';

export const hashPassword = async (password, saltRounds = 10) => {
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
