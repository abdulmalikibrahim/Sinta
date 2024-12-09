import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Link, useNavigate } from 'react-router-dom';
import '../css/MyStyle.css'

const options = [
    {
        name: <><i className='fas fa-bars pe-2'></i><span>MENU</span></>,
        scroll: true,
        backdrop: true,
    },
];

const Sidebar = ({ name, ...props }) => {
    const pathname = window.location.pathname;
    const classNav = "nav-item my-nav pt-2 pb-2 w-100";
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const toggleShow = () => setShow((s) => !s);
    const navigate = useNavigate()
    const LogoutFunc = () => {
        handleClose();
        localStorage.removeItem("session");
        navigate('/login');
    }
    return(
        <>
            <div className='m-2'>
                <Button variant="primary" onClick={toggleShow} className="me-2">
                    {name}
                </Button>
            </div>
            <Offcanvas show={show} onHide={handleClose} {...props} style={{backgroundColor: "rgb(37, 50, 83)", width:"18%"}}>
                <Offcanvas.Header closeButton className='text-light'>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className='p-0'>
                    <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
                        <li className={pathname == "/home" ? classNav + " active-nav" : classNav}>
                            <Link to="/home" className="nav-link text-truncate text-light">
                                <i style={{fontSize:"18pt"}} className="fas fa-home pe-2"></i><span className="ms-1 d-none d-sm-inline">Home</span>
                            </Link>
                        </li>
                        <li className={pathname == "/reoccuring" ? classNav + " active-nav" : classNav}>
                            <Link to="/reoccuring" data-bs-toggle="collapse" className="nav-link text-truncate text-light">
                                <i style={{fontSize:"18pt"}} className="fas fa-clock-rotate-left pe-2"></i><span className="ms-1 d-none d-sm-inline">Reoccuring Job</span> 
                            </Link>
                        </li>
                        <li className='nav-item w-100 my-nav pt-2 pb-2'>
                            <Link onClick={() => LogoutFunc()} data-bs-toggle="collapse" className="nav-link text-truncate text-light">
                                <i style={{fontSize:"18pt"}} className="fas fa-power-off pe-2"></i><span className="ms-1 d-none d-sm-inline">Logout</span> 
                            </Link>
                        </li>
                    </ul>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}


function SideBarApp() {
    return (
        <>
            {options.map((props, idx) => (
                <Sidebar key={idx} {...props} />
            ))}
        </>
    );
}

export default SideBarApp;