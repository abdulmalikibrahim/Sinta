import React from 'react';
import { Link } from 'react-router-dom';

const ButtonBack = ({page}) => {
    return (
        <div className='row mb-3'>
            <div className='col text-end'>
                <Link to={"/"+page} className="btn btn-danger">Back</Link>
            </div>
        </div>
    )
}

export default ButtonBack;