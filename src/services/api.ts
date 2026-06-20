import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // هذا هو رابط مشروع لارافيل
  headers: {
    'Accept': 'application/json', // هذا يضمن أن لارافيل سيعطيكِ JSON دائماً
    'Content-Type': 'application/json',
  },
});

export default api;