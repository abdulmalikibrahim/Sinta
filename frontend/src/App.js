import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'; // Import router
import Navbar from './layout/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import Reoccuring from './pages/Reoccuring';
import Reoccuring_Base from './pages/Reoccuring_Base';
import Reoccuring_Percent from './pages/Reoccuring_Percent';

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const padding = isLoginPage ? "p-0" : "p-4"; 
  const navigate = useNavigate();
  const session = localStorage.getItem("session");

  useEffect(() => {
    if(!session){
      navigate("/login")
    }
  }, [session]);

  return (
    <>
      {location.pathname !== '/login' && <Navbar />}
      <div className={padding} style={{height:'95vh', overflow:'auto'}}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reoccuring" element={<Reoccuring />} />
          <Route path='/reoccuring_base' element={<Reoccuring_Base />} />
          <Route path='/reoccuring_percent' element={<Reoccuring_Percent />} />
        </Routes>
      </div>
    </>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);
export default AppWrapper;
