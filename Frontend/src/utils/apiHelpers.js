
export const handleApiError = (error) => {
    const message = error.message || error.originalError?.response?.data?.message || error.response?.data?.message || 'API Error';
    throw new Error(message);
  };
  
  
  try {
    await studentApi.login(credentials);
  } catch (error) {
    handleApiError(error);
  }