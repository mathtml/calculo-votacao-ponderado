import axios from 'axios';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.get = (url: string) => axios.get(url);
api.post = (url: string, data: any) => axios.post(url, data);
api.put = (url: string, data: any) => axios.put(url, data);
api.delete = (url: string) => axios.delete(url);

export default api;
