import axios from 'axios';

export const registerUser = async (formData: any) => {
  const response = await axios.post('/api/auth/register', formData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response;
};
