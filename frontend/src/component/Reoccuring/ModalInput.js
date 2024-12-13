import { React, useEffect, useState } from "react";
import { Button, Modal, Form } from 'react-bootstrap';
import Swal from "sweetalert2";

const ModalInput = ({...props}) => {
    return (
        <Main props={props}>
            <FormInput tasksUpdate={props.tasksUpdate} session={props.session} modalHide={props.modalHide} jobType={props.jobType} />
        </Main>
    );
}

const Main = ({props,children}) => {
    return (
        <Modal show={props.modal} onHide={props.modalHide}>
            <Modal.Header closeButton>
                <Modal.Title>Base Reoccuring Job {props.jobType}</Modal.Title>
            </Modal.Header>

            {children}
        </Modal>
    )
}

const FormInput = ({tasksUpdate,modalHide, jobType, session}) => {
    const [listGroup,setlistGroup] = useState([])
    const [listUser,setlistUser] = useState([])
    const [user,setUser] = useState("")
    const groupJobFirst = session.data.group ? session.data.group : "";
    const [groupJob,setGroupJob] = useState(groupJobFirst)
    const [rDayShow, setrDayShow] = useState("")
    const [rDateShow, setrDateShow] = useState("")
    const [rDateBiWeeklyShow, setrDateBiWeeklyShow] = useState("")
    const [job, setJob] = useState("")
    const [rDay,setrDay] = useState("")
    const [rDate1,setrDate1] = useState("")
    const [rDate2,setrDate2] = useState("")
    const [methodInput,setmethodInput] = useState("add")
    const [idEdit,setidEdit] = useState("")

    const dataInput = {
        idEdit:idEdit,
        methodInput:methodInput,
        user:user,
        groupJob:groupJob,
        job:job,
        jobType:jobType,
        rDay:rDay,
        rDate1:rDate1,
        rDate2:rDate2,
    }

    useEffect(() => {
        if (jobType === "Daily Task") {
            setrDayShow(false);
            setrDateShow(false);
            setrDateBiWeeklyShow(false);
            setrDay("");
            setrDate1("");
            setrDate2("");
        } else if (jobType === "Weekly Task") {
            setrDayShow(true);
            setrDateShow(false);
            setrDateBiWeeklyShow(false);
            setrDay("Monday");
            setrDate1("");
            setrDate2("");
        } else if (jobType === "Bi Weekly Task") {
            setrDayShow(false);
            setrDateShow(false);
            setrDateBiWeeklyShow(true);
            setrDay("");
            setrDate1("1");
            setrDate2("1");
        } else if (jobType === "Monthly Task") {
            setrDayShow(false);
            setrDateShow(true);
            setrDateBiWeeklyShow(false);
            setrDay("");
            setrDate1("1");
            setrDate2("");
        } else {
            setrDayShow(false);
            setrDateShow(false);
            setrDateBiWeeklyShow(false);
            setrDay("");
            setrDate1("");
            setrDate2("");
        }
    },[])

    useEffect(() => {
        if(tasksUpdate){
            setmethodInput("edit")
            setidEdit(tasksUpdate.id)
            setUser(tasksUpdate.user)
            setGroupJob(tasksUpdate.groupjob)
            setJob(tasksUpdate.job)
            const reoccuring_tipe = tasksUpdate.reoccuring_tipe;
            const reoccuring_unset = tasksUpdate.reoccuring_unset;
            if(reoccuring_tipe === "Day"){
                setrDay(reoccuring_unset)
            }
            
            if(reoccuring_tipe === "Date"){
                const rUnsetSplit = reoccuring_unset.split(",");
                if(rUnsetSplit.length > 1){
                    setrDate1(rUnsetSplit[0])
                    setrDate2(rUnsetSplit[1])
                }else{
                    setrDate1(rUnsetSplit[0])
                }
            }

            jobType = tasksUpdate.tipe;
        }
    },[tasksUpdate])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL;
            const url = methodInput === "add" ? `${API_BASE_URL}/api/addReoccuringBase` : `${API_BASE_URL}/api/updateReoccuringBase`
            
            const action = await fetch(url, {
                method:"POST",
                headers:{"Content-Type" : "application/json"},
                body:JSON.stringify(dataInput)
            })
    
            const result = await action.json()
    
            if(action.ok){
                modalHide()
            }else{
                const messageError = result.error;
                Swal.fire({
                    title:"Error",
                    html:`Error : ${messageError}`,
                    icon:"error"
                })
            }
        } catch (error) {
            Swal.fire({
                title:"Error",
                html:`Error : ${error}`,
                icon:"error"
            })
        }
    }

    const loopDay = () => {
        const day = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
        return day.map((e) => <option key={e} value={e}>{e}</option>);
    }

    const loopDate = () => {
        return Array.from({ length: 31 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
        ));
    };

    const API_BASE_URL = process.env.REACT_APP_API_URL;
    const urlGetGroup = `${API_BASE_URL}/api/getGroupJob`;
    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetch(urlGetGroup);
                const data = await response.json();
                const options = [<option key="firstOptionsGroup" value="">Pilih Group</option>]
                data.data.map((e) => (
                    options.push(
                        <option key={e.id} value={e.id}>
                            [{e.code}] {e.name}
                        </option>
                    )
                ))
                setlistGroup(options)
            } catch (error) {
                console.error("error",error);
            }
        }

        getData()
    }, [urlGetGroup]);
    
    useEffect(() => {
        const API_BASE_URL = process.env.REACT_APP_API_URL;
        const urlGetUser = `${API_BASE_URL}/api/getUser`;
        const getData = async () => {
            try {
                if(!groupJob){
                    setlistUser([])
                    return null
                }
                const response = await fetch(urlGetUser,{
                    method:"POST",
                    headers:{"Content-Type" : "application/json"},
                    body:JSON.stringify({
                        groupID: groupJob
                    })
                })
                const data = await response.json();
                const options = data.data.map((e) => (
                    <option key={e.id} value={e.id}>{e.nama}</option>
                ))
                setlistUser(options)
                setUser(data.data[0].id)
            } catch (error) {
                console.error("error",error)
            }
        }

        getData()
    },[groupJob])

    return(
        <>
        <Modal.Body>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Job</Form.Label>
                    <Form.Control as="textarea" rows={3} onChange={(e) => setJob(e.target.value)} value={job} placeholder="Masukkan job disini" required/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Group</Form.Label>
                    <Form.Select onChange={(e) => setGroupJob(e.target.value)} value={groupJob} required>
                        {listGroup}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>PIC</Form.Label>
                    <Form.Select onChange={(e) => setUser(e.target.value)} value={user} required>
                        {listUser}
                    </Form.Select>
                </Form.Group>
                {rDayShow && (
                    <Form.Group className="mb-3">
                        <Form.Label>Day</Form.Label>
                        <Form.Select onChange={(e) => setrDay(e.target.value)} value={rDay} required>{loopDay()}</Form.Select>
                    </Form.Group>
                )}
                {rDateBiWeeklyShow && (
                    <div className="row mb-3">
                        <div className="col">
                            <Form.Label>Date 1</Form.Label>
                            <Form.Select onChange={(e) => setrDate1(e.target.value)} value={rDate1} required>{loopDate()}</Form.Select>
                        </div>
                        <div className="col">
                            <Form.Label>Date 2</Form.Label>
                            <Form.Select onChange={(e) => setrDate2(e.target.value)} value={rDate2} required>{loopDate()}</Form.Select>
                        </div>
                    </div>
                )}
                {rDateShow && (
                    <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <Form.Select onChange={(e) => setrDate1(e.target.value)} value={rDate1} required>{loopDate()}</Form.Select>
                    </Form.Group>
                )}
                <div className="row">
                    <div className="col text-end">
                        <Button variant="secondary" className="me-2" onClick={modalHide}>Close</Button>
                        <Button variant="primary" type="submit">Save changes</Button>
                    </div>
                </div>
            </Form>
        </Modal.Body>
        </>
    )
}

export default ModalInput