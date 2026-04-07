import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Your Backend Address
});

// This automatically adds your JWT token to every request if you're logged in
API.interceptors.request.use((req) => {
    const profile = localStorage.getItem('userInfo');
    if (profile) {
        const { token } = JSON.parse(profile);
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;