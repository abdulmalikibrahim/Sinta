import { useState, useEffect } from 'react';

const UseToken = () => {
    const [token, setToken] = useState('');

    const API_BASE_URL = process.env.REACT_APP_API_URL;
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/getToken`)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.token) {
                    setToken(data.token); // Ambil nilai token
                } else {
                    console.error('Token not found in response:', data);
                }
            })
            .catch((error) => console.error('Error fetching token:', error));
    }, []);

    return token;
};

export default UseToken;
