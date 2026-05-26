
export const handleApiError = (error) => {
    const message = error.response?.data?.error || error.message || 'API Error';
    throw new Error(message);
  };
  
  
  try {
    await studentApi.login(credentials);
  } catch (error) {
    handleApiError(error);
  }