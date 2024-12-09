import React from 'react';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // import Link dari react-router-dom

const Navbar = () => {
    const navigate = useNavigate()
    const LogoutFunc = () => {
        localStorage.removeItem("session");
        navigate('/login');
    }
    return (
        <div className='p-4 pb-0'>
            <div className="row justify-content-center align-items-center">
                <div className="col-3">
                    <Link style={{textDecoration:'none'}} to='/home'><h3 className='font-weight-bold text-light m-0'>WORKING LIST APPS</h3></Link>
                </div>
                <div className='col'>
                    <Link style={{textDecoration:'none'}} to='/reoccuring' className='text-light'>Reoccuring Job</Link>
                </div>
                <div className="col text-end">
                    <Button variant='info' onClick={() => LogoutFunc()}><i className='fas fa-power-off pe-2'></i>Logout</Button>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
