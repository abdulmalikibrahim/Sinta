import React, { useEffect, useState } from 'react';
import '../css/Login.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const LoginPage = () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [labelLogin, setLabelLogin] = useState('Login Now');
  const navigate = useNavigate();

  useEffect(() => {
    if(localStorage.getItem("session")){
      navigate("/home")
    }
  },[])

  const handleLogin = async () => {
    setLabelLogin('Logging...')
    try {
      // Kirim data username dan password ke backend
      const response = await fetch(`${API_BASE_URL}/api/validateLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Request is being finished.');
        navigate('/home');
        localStorage.removeItem("session");
        localStorage.setItem("session",JSON.stringify(result));
      } else {
        Swal.fire({title:"Error",html:result.data.message,icon:"warning"});
      }
    } catch (error) {
      console.error('Terjadi kesalahan:', error);
      Swal.fire({title:"Error",html:"Terjadi kesalahan saat login.",icon:"error"});
    } finally {
      setUsername('');
      setPassword('');
    }
    setLabelLogin('Login Now')
  };

  const handleEnter = (e) => {
    //JIKA ENTER
    console.log(e.key)
    if(e.key === "Enter"){
      handleLogin()
    }
  }

  return (
    <div className="login">
      <h1 className='mb-4'>Login SINTA</h1>
        <input className='input-login' type="text" name="username" onChange={(e) => setUsername(e.target.value)} value={username} placeholder="Username" onKeyUp={(e) => handleEnter(e)} required />
        <input className='input-login' type="password" name="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password" onKeyUp={(e) => handleEnter(e)} required />
        <button onClick={handleLogin} className="btn btn-login-primary btn-login-block btn-login-large">{labelLogin}</button>
    </div>
  );
};

export default LoginPage;