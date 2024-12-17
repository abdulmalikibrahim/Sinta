import React, {useEffect, useState} from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
// import UseToken from './UseToken';
import Swal from 'sweetalert2'
import GroupList from '../../component/GroupList';
import ShowRelatedPIC from './RelatedPIC';

const ModalInput = ({ show, handleClose, modalData, showData }) => {
  const [method, setMethod] = useState(modalData.method);
  const [idItem, setidItem] = useState(modalData.idItem);
  const [job, setJob] = useState(modalData.job); // State untuk textarea (Job)
  const [targetDate, setTargetDate] = useState(modalData.tanggal); // State untuk input tanggal
  const [targetTime, setTargetTime] = useState(modalData.waktu); // State untuk input tanggal
  const [type, setType] = useState(modalData.type);
  const [keterangan, setKeterangan] = useState(modalData.detail === undefined ? "" : modalData.detail);
  const [pic, setPIC] = useState(modalData.groupjobid);
  const session = JSON.parse(localStorage.getItem("session"));
  const [relatedPIC,setrelatedPIC] = useState(localStorage.getItem("relatedPIC"))

  useEffect(() => {
    setidItem(modalData.idItem);
    setMethod(modalData.method);
    setJob(modalData.job); // State untuk textarea (Job)
    setTargetDate(modalData.tanggal); // State untuk input tanggal
    setTargetTime(modalData.waktu); // State untuk input tanggal
    setType(modalData.type);
    setKeterangan(modalData.detail);
    setPIC(modalData.groupjobid);
    if(modalData.method === "add"){
      console.log(modalData.method)
      localStorage.setItem("relatedPIC",[])
      setrelatedPIC([])
    }
  },[modalData])

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const url = method === "add" ? `${API_BASE_URL}/api/addJob` : `${API_BASE_URL}/api/updateJob`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idItem:idItem,
          columnId: modalData.columnId,
          job:job,
          date:targetDate,
          time:targetTime,
          type:type,
          detail: keterangan,
          inputer: session.data.id,
          groupjob: pic,
          relatedPIC:relatedPIC,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setJob('');
        setType('');
        setKeterangan('');
        handleClose(); // Tutup modal setelah berhasil
        showData(modalData.columnId);// Ambil token baru setelah request selesai
      } else {
        const textError = `Error: ${data.error}`;
        Swal.fire({
          title: 'Error',
          text: textError,
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while saving the job.\nError : '+error,
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  };

  const handleJobChange = (e) => {
    setType(e.target.value);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{modalData.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Job <span className='text-danger'>*</span></Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Masukkan pekerjaan disini" value={job} onChange={(e) => setJob(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Target <span className='text-danger'>*</span></Form.Label>
            <InputGroup>
              <Form.Control type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
              <Form.Control type="time" value={targetTime} onChange={(e) => setTargetTime(e.target.value)} required />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Type <span className='text-danger'>*</span></Form.Label>
            <Form.Select value={type} onChange={handleJobChange} required>
              <option value="Other">Other</option>
              <option value="Meeting">Meeting</option>
              <option value="Discuss">Discuss</option>
              <option value="Review">Review</option>
              <option value="Approval">Approval</option>
            </Form.Select>
          </Form.Group>
          {
            session.data.group === 7 ? 
            <Form.Group className="mb-3">
              <Form.Label>PIC <span className='text-danger'>*</span></Form.Label>
              {<GroupList selectedPIC={pic} onChange={(value) => setPIC(value)}/>}
            </Form.Group> : ""
          }
          <ShowRelatedPIC />
          <Form.Group className="mb-3">
            <Form.Label>Keterangan (Optional)</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Masukkan keterangan disini" value={keterangan} onChange={(e) => setKeterangan(e.target.value)}/>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
                Close
            </Button>
            <Button variant="primary" type="submit">
                Save Changes
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalInput;