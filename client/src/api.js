import axios from 'axios';

const api = axios.create({
  baseURL: 'https://inkwell-server-7l9m.onrender.com',
});

export default api;
