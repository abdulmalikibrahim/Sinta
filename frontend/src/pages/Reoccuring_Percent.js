import { React, useEffect, useState } from "react";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import ButtonBack from "../component/ButtonBack";

const Reoccuring_Percent = () => {
    const API_BASE_URL = process.env.REACT_APP_API_URL;
    const [error,setError] = useState("");
    const [timePick, setTimePick] = useState("Daily")
    const [dataCompleteTime, setdataCompleteTime] = useState([])
    const [dataRemainTime, setdataRemainTime] = useState([])
    const [dataCompleteGroup, setdataCompleteGroup] = useState([])
    const [dataRemainGroup, setdataRemainGroup] = useState([])
    const dataByTime = [
        {"Daily Task" : "Daily"},
        {"Weekly Task" : "Weekly"},
        {"Bi Weekly Task" : "BiWeekly"},
        {"Monthly Task" : "Monthly"}
    ];
    const [group,setGroup] = useState([])

    useEffect(() => {
        const taskComplete = async () => {
            try {
                const data = await fetch(`${API_BASE_URL}/api/getTask`,{
                    method:"POST",
                    headers:{"Content-Type" : "application/json"},
                    body:JSON.stringify({
                        type:"Complete",
                        filter: ""
                    })
                });
    
                if(!data.ok){
                    setError(data.status);
                }
                const result = await data.json()
                setdataCompleteTime(result.data)
            } catch (error) {
                setError(error.message)
            }
        }
        taskComplete();
        
        const taskRemain = async () => {
            try {
                const data = await fetch(`${API_BASE_URL}/api/getTask`,{
                    method:"POST",
                    headers:{"Content-Type" : "application/json"},
                    body:JSON.stringify({
                        type:"Remain",
                        filter: ""
                    })
                });
    
                if(!data.ok){
                    setError(data.status);
                }
                const result = await data.json()
                setdataRemainTime(result.data)
            } catch (error) {
                setError(error.message)
            }
        }
        taskRemain();

        const intervalid = setInterval(() => {
            taskComplete()
            taskRemain()
        }, 5000);
        return () => clearInterval(intervalid)
    },[])

    useEffect(() => {
        const getDataGroup = async () => {
            const getData = await fetch(`${API_BASE_URL}/api/getGroupJob`)
            const result = await getData.json()
            const group = result.data;
            setGroup(group)
        }

        getDataGroup()
    },[])
    
    useEffect(() => {
        const taskComplete = async () => {
            try {
                const data = await fetch(`${API_BASE_URL}/api/getTask`,{
                    method:"POST",
                    headers:{"Content-Type" : "application/json"},
                    body:JSON.stringify({
                        type:"Complete",
                        filter: "group"
                    })
                });
    
                if(!data.ok){
                    setError(data.status);
                }
                const result = await data.json()
                setdataCompleteGroup(result.data)
            } catch (error) {
                setError(error.message)
            }
        }
        taskComplete();
        
        const taskRemain = async () => {
            try {
                const data = await fetch(`${API_BASE_URL}/api/getTask`,{
                    method:"POST",
                    headers:{"Content-Type" : "application/json"},
                    body:JSON.stringify({
                        type:"Remain",
                        filter: "group"
                    })
                });
    
                if(!data.ok){
                    setError(data.status);
                }
                const result = await data.json()
                setdataRemainGroup(result.data)
            } catch (error) {
                setError(error.message)
            }
        }
        taskRemain();
        const intervalid = setInterval(() => {
            taskComplete()
            taskRemain()
        }, 5000);
        return () => clearInterval(intervalid)
    },[])
    
    return (
        <>
        <ButtonBack page={"reoccuring"} />
        <CardGroup error={error}>
            {
                dataByTime.map((element,index) => {
                    const [taskType] = Object.keys(element); // Extract the key from the object
                    const taskKey = element[taskType]; // Get the value for the key
                    return(
                        <CardTask 
                        title={taskType} 
                        key={index}
                        dataComplete={dataCompleteTime.find(item => item[taskKey])?.[taskKey]?.[0]?.total}
                        dataRemain={dataRemainTime.find(item => item[taskKey])?.[taskKey]?.[0]?.total}
                        type={"main"} 
                        taskKey={taskKey}
                        setTimePick={setTimePick} />
                    )
                })
            }
        </CardGroup>
        <CardGroup error={error}>
            <h4 className="mt-4 mb-3 text-light">ACHIEVEMENT BY GROUP {timePick.toUpperCase()}</h4>
            {
                group.map((element,index) => {
                    const idGroup = element.id
                    const nameGroup = element.name
                    const completeData = dataCompleteGroup.find(item => item[timePick])?.[timePick] || []
                    const remainData = dataRemainGroup.find(item => item[timePick])?.[timePick] || []

                    const totalComplete = completeData.find(item => item.groupjob === idGroup)?.total || 0
                    const totalRemain = remainData.find(item => item.groupjob === idGroup)?.total || 0

                    return(
                        <CardTask 
                        title={nameGroup} 
                        key={index}
                        dataComplete={totalComplete}
                        dataRemain={totalRemain}
                        type={"section"}
                        taskKey={idGroup}
                        setTimePick={setTimePick} />
                    )
                })
            }
        </CardGroup>
        </>
    )
}

const CardGroup = ({error,children}) => {
    return(
        <>
        <div className="row">
            {
                error ? <div className="col-12">{error}</div> : ""
            }
            {children}
        </div>
        </>
    )
}

const CardTask = ({title,dataComplete,dataRemain,type,taskKey = null,setTimePick}) => {
    // Register Chart.js components
    ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
    // Data untuk pie chart
    const data = {
        labels: ['Complete', 'Remain'], // Label kategori
        datasets: [
            {
                label: 'Data Remain VS Complete',
                data: [dataComplete, dataRemain], // Data untuk setiap kategori
                backgroundColor: ['#33C1FF','#FF5733'], // Warna untuk masing-masing kategori
                hoverOffset: 4, // Efek saat hover,
            },
        ],
    };

    // Opsi chart (opsional)
    const options = {
        responsive: true, // Responsif di berbagai ukuran layar
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                    return tooltipItem.raw + ' task'; // Menampilkan unit di tooltip
                    },
                },
            },
        },
    };
    
    return (
        <div className="col-3 mb-4">
            <div className="card border-0" style={{minHeight:"340px"}}>
                <div className="card-header text-center bg-secondary text-light fw-bold" style={{fontSize:"14pt"}}>{title}</div>
                <div className="card-body d-flex justify-content-center" style={{backgroundColor: '#253253', color:'#fff'}}>
                    {
                        (parseInt(dataRemain + dataComplete) > 0) ? <div style={{maxWidth:"60%"}}><Pie data={data} options={options} /></div> : "Tidak ada data task"
                    }

                    {
                        type === "main" ? 
                        <div className="row w-100 mt-3 fw-bold" style={{position:"absolute", bottom:"10px", left: "10px", fontSize:"10pt"}}>
                            <div className="col-4 pe-0">Complete : {dataComplete}</div>
                            <div className="col-4 p-0 text-center">
                                <button className="btn btn-sm btn-info" style={{fontSize:"7pt"}} onClick={() => setTimePick(taskKey)}>Detail By Group</button>
                            </div>
                            <div className="col-4 ps-0 text-end">Remain : {dataRemain}</div>
                        </div> :
                        <div className="row w-100 mt-3 fw-bold" style={{position:"absolute", bottom:"10px", left: "10px"}}>
                            <div className="col-6">Complete : {dataComplete}</div>
                            <div className="col-6 text-end">Remain : {dataRemain}</div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Reoccuring_Percent;