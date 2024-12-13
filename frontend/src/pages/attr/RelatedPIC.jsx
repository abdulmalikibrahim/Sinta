import React, { useEffect, useState } from 'react';
import GroupList from '../../component/GroupList';
import { Form } from 'react-bootstrap';

const ShowRelatedPIC = () => {
    useEffect(() => {
        const dataRelated = localStorage.getItem("relatedPIC");
        if(dataRelated){
            const output = dataRelated.split(',').map(item => item.trim());
            setRelatedPICs(output);
        }
    },[])
    const [relatedPICs, setRelatedPICs] = useState([""]);  // Initialize with one empty PIC
  
    const addPIC = () => {
        setRelatedPICs([...relatedPICs, ""]); // Add an empty value for the new PIC
    };

    const deletePIC = (index) => {
        const updatedPICs = relatedPICs.filter((_, i) => i !== index); // Remove the selected PIC at the specified index
        setRelatedPICs(updatedPICs);
        localStorage.setItem("relatedPIC",updatedPICs)
    };
  
    const updatePIC = (index, value) => {
        const updatedPICs = [...relatedPICs];
        updatedPICs[index] = value; // Update the selected PIC at the specified index
        setRelatedPICs(updatedPICs);
        localStorage.setItem("relatedPIC",updatedPICs)
    };
  
    return (
        <>
            <Form.Group className="mb-3">
                <div className="row mb-2">
                    <div className="col-6 d-flex align-items-center">
                        <Form.Label className='m-0'>Related PIC (Optional)</Form.Label>
                    </div>
                    <div className="col-6 d-flex justify-content-end">
                        <button className='btn btn-sm btn-info' onClick={addPIC} type="button">
                            <i className='fas fa-plus m-0'></i>
                        </button>
                    </div>
                </div>
                <div>
                    {relatedPICs.map((pic, i) => (
                        <div className='input-group mb-2' key={i}>
                            <GroupList
                                selectedPIC={pic}
                                onChange={(value) => updatePIC(i, value)}
                            />
                            {relatedPICs.length > 1 && ( // Only show the delete button if more than one PIC exists
                                <button
                                    className='btn btn-danger'
                                    onClick={() => deletePIC(i)} // Pass the correct index to delete the specific PIC
                                    type="button">
                                    <i className='fas fa-minus m-0'></i>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </Form.Group>
        </>
    );
};

export default ShowRelatedPIC;
