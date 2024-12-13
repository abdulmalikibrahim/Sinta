import React, {useEffect, useState} from 'react';
import { Button } from 'react-bootstrap';

const GroupSelected = () => {
    const [groupSelected,setgroupSelected] = useState([])
    const [dataGroup,setdataGroup] = useState([])
    const API_URL = process.env.REACT_APP_API_URL
    useEffect(() => {
        const groupSelect = localStorage.getItem("groupSelect")
        if(groupSelect){
            setgroupSelected(JSON.parse(groupSelect))
        }

        const getDataGroup = async () => {
            const group = await fetch(`${API_URL}/api/getGroupJob`);
            const result = await group.json();
            setdataGroup(result.data)
        }

        getDataGroup()
    },[])
    return (
        <div className='p-0' style={{position:"absolute", top:"8px", left:"10%"}}>
            <div className="row justify-content-center align-items-center">
                {
                    dataGroup.map((el,index) => {
                        const codeGroup = el.code
                        const varButton = groupSelected[codeGroup] ? "info" : "light"
                        const checkIcon = groupSelected[codeGroup] ? <i className='fas fa-check-circle pe-2 text-light'></i> : ""
                        return(
                            <div className="col text-end" key={index}>
                                <Button style={{width:"6rem"}} variant={varButton} onClick={() => FilterFunc({codeGroup,groupSelected,setgroupSelected})}>{checkIcon}{codeGroup}</Button>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
};

const FilterFunc = ({codeGroup,groupSelected,setgroupSelected}) => {
    const arrayGroup = groupSelected
    const keyGroup = codeGroup
    const valGroup = codeGroup
    if(arrayGroup[keyGroup]){
        //HAPUS DATA SELECTED
        delete arrayGroup[keyGroup]
    }else{
        arrayGroup[keyGroup] = valGroup
    }
    const newGroup = {...groupSelected, ...arrayGroup}
    setgroupSelected(newGroup)
    localStorage.setItem("groupSelect",JSON.stringify(newGroup))
}

export default GroupSelected;
