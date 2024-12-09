import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import ModalInput from '../component/Reoccuring/ModalInput';
import { Link } from 'react-router-dom';
import "../css/Home.css";
import ButtonBack from '../component/ButtonBack';


const Reoccuring = () => {
    const session = JSON.parse(localStorage.getItem('session'));
    const card = ["Daily Task","Weekly Task","Bi Weekly Task","Monthly Task"];
    const [tasks, setTasks] = useState();
    const [tasksUpdate, setTasksUpdate] = useState();
    const [modal, setModal] = useState();
    const [jobType, setJobType] = useState(null);
    const modalHide = () => { setModal(false) };
    const modalShow = (type) => {
        setJobType(type)
        setModal(true)
    };
    
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const API_BASE_URL = process.env.REACT_APP_API_URL;
                const idGroup = session.data.group;
                // Menggunakan Promise.all untuk menjalankan semua request secara paralel
                const results = await Promise.all(
                    card.map(async (typeTask) => {
                        const response = await fetch(`${API_BASE_URL}/api/ListReoccuringBase`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                idGroup: idGroup,
                                type: typeTask,
                            }),
                        });
                        const data = await response.json();
                        return data.data;
                    })
                );
    
                setTasks(results); // Menyimpan semua hasil ke state
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        
        fetchTasks()
    }, [tasks]);
    if(!tasks) return null;

    return (
        <>
            {
                session && <CardTask 
                card={card} 
                session={session} 
                tasks={tasks} 
                modal={modal} 
                modalHide={modalHide} 
                modalShow={modalShow}
                setTasksUpdate={setTasksUpdate}
            />
                
            }
            {modal && <ModalInput modal={modal} modalHide={modalHide} tasksUpdate={tasksUpdate} session={session} jobType={jobType} />}
        </>
    )
}

const CardTask = ({...props}) => {
    return (
        <>
            <ButtonBack page={"reoccuring"} />
            <div className='row pe-2 ps-2'>
                {props.card.map((e,index) => (
                    <div key={index} className='col'>
                        <div className='card border-0'>
                            <div className='card-header text-center bg-secondary fw-bold text-light'>{e}</div>
                            <div className='card-body ps-0 pe-0 pt-0 border-0 scrollRoomCard' style={{ minHeight: '34rem', height: '34rem', backgroundColor: '#253253', overflow:"auto" }}>
                                <ListJob session={props.session} tasks={props.tasks[index]} setTasksUpdate={props.setTasksUpdate} modalShow={props.modalShow} />
                            </div>
                            <CardFooter nameTask={e} index={index} modal={props.modal} modalHide={props.modalHide} modalShow={props.modalShow} />
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

const ListJob = ({session,tasks,setTasksUpdate,modalShow}) => {
    return(
        tasks.map((task, taskIndex) => {
            let information = "";
            if(task.tipe === "Daily Task"){
                information = "Every Day";
            }else if(task.tipe === "Weekly Task"){
                information = `Every ${task.reoccuring_unset}`;
            }else if(task.tipe === "Bi Weekly Task"){
                information = `Every Date ${task.reoccuring_unset.replaceAll(","," & ")}`;
            }else if(task.tipe === "Monthly Task"){
                information = `Every Date ${task.reoccuring_unset}`;
            }
            return (
                <div className='card border-0 mb-1' key={taskIndex}>
                    <div className='card-body rounded-0 text-light pt-0 pb-0 ps-0' style={{backgroundColor:"#555"}}>
                        <div className='row'>
                            <div className='col p-2 ps-4'>
                                <div className='row'>
                                    <div className='col-8'><b>[{task.code}]</b><br></br>{task.job}</div>
                                    <div className='col text-end' style={{fontSize:"7pt"}}>{information}</div>
                                </div>
                                <div className='row' style={{fontSize:"9pt"}}>
                                    <div className='col'>{task.nama}</div>
                                    <div className='col text-end d-flex justify-content-end align-items-center'>
                                        <button className='btn btn-sm btn-info me-2' title='Edit' onClick={() => handleUpdate(task,setTasksUpdate,modalShow)}><i className='fas fa-pencil-alt text-light'></i></button>
                                        {
                                            session.data.group === 7 && <button className='btn btn-sm btn-danger' title='Edit' onClick={() => deleteData(task.id)}><i className='fas fa-trash-alt text-light'></i></button>
                                        }
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        })
    )
}

const CardFooter = ({modalShow,nameTask}) => {

    const handleAdd = () => {
        modalShow(nameTask)
    }
    return (
        <div className="card-footer text-end bg-secondary">
            <button className="btn btn-info" onClick={handleAdd}>
                Tambah
            </button>
        </div>
    )
}

const handleUpdate = (tasks,setTasksUpdate,modalShow) => {
    setTasksUpdate(tasks)
    modalShow(tasks.tipe)
}

const deleteData = async (id) => {
    Swal.fire({
        title: 'Apakah anda yakin?',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#bdb9b9',
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel',  // Teks untuk tombol Cancel
    }).then(async (result) => {
        if(result.isConfirmed){
            try {
                const API_BASE_URL = process.env.REACT_APP_API_URL;
                const action = await fetch(`${API_BASE_URL}/api/deleteReoccuringBase`,{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({
                        id:id
                    })
                });
                
                const response = await action.json();
                
                if(!action.ok){
                    Swal.fire({
                        title:"Error",
                        html:`Data gagal di hapus\n ${response.error}`,
                        icon:"error"
                    })
                    return;
                }
            } catch (error) {
                Swal.fire({
                    title:"Error",
                    html:`Data gagal di hapus\n ${error}`,
                    icon:"error"
                })
            }
        }
    })
}

export default Reoccuring;
