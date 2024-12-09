import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import '../css/Home.css'


const Reoccuring = () => {
    const session = JSON.parse(localStorage.getItem('session'));
    const card = ["Daily Task","Weekly Task","Bi Weekly Task","Monthly Task"];
    const [tasks, setTasks] = useState();
    const [modal, setModal] = useState();
    const modalHide = () => { setModal(false) };
    const modalShow = () => { setModal(true) };
    const fetchTasks = async () => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL;
            const idGroup = session.data.group;
            // Menggunakan Promise.all untuk menjalankan semua request secara paralel
            const results = await Promise.all(
                card.map(async (typeTask) => {
                    const response = await fetch(`${API_BASE_URL}/api/ListReoccuring`, {
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

    useEffect(() => {
        fetchTasks()
        const intervalID = setInterval(fetchTasks, 5000);
        return () => clearInterval(intervalID)
    }, []);
    if(!tasks) return null;

    return (
        session && <CardTask card={card} session={session} tasks={tasks} modal={modal} modalHide={modalHide} modalShow={modalShow} fetchTasks={fetchTasks} />
    )
}

const CardTask = ({...props}) => {
    return (
        <div className='ps-2 pe-2'>
            <div className='row mb-3'>
                <div className='col text-end'>
                    {
                        props.session.data.group === 7 ? <Link to="/reoccuring_percent" className="btn btn-info me-2">Percentage</Link> : ""
                    }
                    <Link to="/reoccuring_base" className="btn btn-primary">Tambah Base</Link>
                </div>
            </div>
            <div className='row'>
                {props.card.map((e,index) => (
                    <div key={index} className='col'>
                        <div className='card border-0'>
                            <div className='card-header text-center bg-secondary fw-bold text-light'>{e}</div>
                            <div className='card-body ps-0 pe-0 pt-0 border-0 scrollRoomCard' style={{ minHeight: '37rem', height: '37rem', backgroundColor: '#253253' }}>
                                <ListJob tasks={props.tasks[index]} fetchTasks={props.fetchTasks} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const ListJob = ({tasks,fetchTasks}) => {
    return(
        tasks.map((task, taskIndex) => {
            const diffDays = diffDate(task.created, task.tipe)
            return (
                <div className='card border-0 mb-1' key={taskIndex}>
                    <div className='card-body rounded-0 text-light pt-0 pb-0 ps-0' style={{backgroundColor:"rgb(73, 55, 76)"}}>
                        <div className='row'>
                            <div className='col-3 d-flex justify-content-start align-items-center'>
                                {
                                    task.status > 0 ? 
                                    <button style={{fontSize:'30pt', height:'100%', width:'100px'}} className='btn btn-sm btn-success p-0' onClick={() => handleCheck(task.id,0,fetchTasks)}>
                                        <i className='fas fa-check'></i>
                                    </button> : 
                                    <button style={{fontSize:'30pt', height:'100%', width:'100px'}} className='btn btn-sm btn-danger p-0' onClick={() => handleCheck(task.id,1,fetchTasks)}>
                                        <i className='fas fa-times'></i>
                                    </button>
                                }
                                
                            </div>
                            <div className='col p-2 ps-1'>
                                <div className='row'>
                                    <div className='col-8' style={{fontSize:"8pt"}}>Created : {convertDate(task.created)}</div>
                                    <div className='col-4 d-flex justify-content-end ps-0'>
                                        {
                                            
                                            diffDays > 0 ? <span style={{fontSize:"8pt"}} className='badge bg-danger'>Over {diffDays} days</span> : <span style={{fontSize:"8pt"}} className='badge bg-success'>Ontime</span>
                                        }
                                    </div>
                                    <div className='col-8'><span style={{fontSize:"10pt"}}><b>[{task.code}]</b> {task.job}</span></div>
                                    <div className='col text-end d-flex justify-content-end align-items-center' style={{fontSize:"6pt"}}>{task.date_finish ? convertDate(task.date_finish) : ""}</div>
                                </div>
                                <div className='row mt-2' style={{fontSize:"9pt"}}>
                                    <div className='col' style={{fontSize:"8pt"}}>{task.nama}</div>
                                    <div className='col text-end' style={{fontSize:"8pt"}}>{task.groupname}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        })
    )
}

const diffDate = (created, tipe) => {
    const current = new Date();
    const createdDate = new Date(created)

    const formatCurrent = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`
    const formatCreated = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`
    
    const diffDate = Math.abs(current - createdDate);
    let diffDays = Math.ceil(diffDate / (1000 * 60 * 60 * 24));
    let minus = 0;
    switch (tipe.replaceAll(" Task","").replaceAll(" ","")) {
        case "Weekly":
            minus = 7
            break;
        case "BiWeekly":
            minus = 15
            break;
        case "Monthly":
            minus = 30
            break;
        default:
            minus = 0
            break;
    }

    if(formatCreated === formatCurrent){
        diffDays = 0;
    }

    diffDays = diffDays - minus
    return diffDays;
}

const convertDate = (isoDate) => {
    const date = new Date(isoDate);

    // Ambil bagian tanggal
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Ambil bagian waktu
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Gabungkan menjadi format yang diinginkan
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const handleCheck = async (taskId,status,fetchTasks) => {
    try {
        const API_BASE_URL = process.env.REACT_APP_API_URL;
        const updateData = await fetch(`${API_BASE_URL}/api/updateReoccuringJob`,{
            method:"POST",
            headers:{"Content-Type" : "application/json"},
            body:JSON.stringify({
                taskId:taskId,
                status:status,
            })
        })
        
        if(!updateData.ok){
            const messageError = await updateData.text();
            Swal.fire({
                title:"Error",
                html:messageError,
                icon:"error"
            });
        }
    } catch (error) {
        Swal.fire({
            title:"Error",
            html:error.message,
            icon:"error",
        });
    } finally {
        fetchTasks()
    }
    return;
}

export default Reoccuring;
