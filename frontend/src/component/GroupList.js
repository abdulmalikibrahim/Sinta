import React, { useEffect, useState } from "react";
import { Form } from 'react-bootstrap';

const GroupList = ({ selectedPIC, onChange }) => {
    const API_BASE_URL = process.env.REACT_APP_API_URL;
    const [dataList, setDataList] = useState([]);

    const url = `${API_BASE_URL}/api/getGroupJob`;
    useEffect(() => {
        const getData = async () => {
            try {
                const data = await fetch(url);
                const response = await data.json();
                setDataList(response.data);
            } catch (error) {
                console.error("error",error);
            }
        }

        getData()
    }, [url]);

    return (
        <Form.Select value={selectedPIC} onChange={(e) => onChange(e.target.value)} required>
            <option value="">Pilih PIC</option>
            {dataList.map((item) => (
                <option key={item.id} value={item.id}>[{item.code}] {item.name}</option>
            ))}
        </Form.Select>
    );
}

export default GroupList;