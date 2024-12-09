import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import "../css/Home.css";
import {Button} from 'react-bootstrap';
import ModalInput from './attr/ModalInput';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Komponen utama Home
function Home() {
  const session = JSON.parse(localStorage.getItem("session"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);

  const [columns, setColumns] = useState({
    upcoming: { id: 'upcoming', title: 'Upcoming Problem', items: [] },
    issued: { id: 'issued', title: 'Issued Problem', items: [] },
    todo: { id: 'todo', title: 'To-do', items: [] },
    progress: { id: 'progress', title: 'On Progress', items: [] },
    approved: { id: 'approved', title: 'Approved & Finalization', items: [] },
    complete: { id: 'complete', title: 'Completed', items: [] },
    recycle: { id: 'recycle', title: 'Recycle Bin', items: [] }
  });
  const [show, setShow] = useState(false);
  const [groupjob, setGroupJob] = useState(() => {
    const session = JSON.parse(localStorage.getItem("session"));
    return session?.data?.group ?? ""; // Jika session atau session.data tidak ada, set groupjob menjadi ""
  });
  const dateNow = new Date();
  const Tanggal = `${dateNow.getFullYear()}-${String(dateNow.getMonth() + 1).padStart(2, "0")}-${String(dateNow.getDate()).padStart(2, "0")}`;
  const Waktu = dateNow.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});
  const [modalData, setModalData] = useState({
    method:'add',
    idItem:0,
    title:"",
    columnId:"",
    job: "",
    tanggal: Tanggal,
    waktu: Waktu,
    type: "Other",
    detail: "",
    groupjobid: groupjob
  })
  
  const showData = async (columnId) => {
    const API_BASE_URL = process.env.REACT_APP_API_URL;
    const res = await fetch(`${API_BASE_URL}/api/ListJob`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
      },
      body: JSON.stringify({
        columnId:columnId,
        groupjob:session.data.group,
      })
    });
    const data = await res.json();
    setColumns((prevColumns) => ({
      ...prevColumns,
      [columnId]:
      {
        ...prevColumns[columnId],
        items: data.data
      }
    }));
  }
  
  useEffect(() => {
    if(session){
      const columnIds = Object.keys(columns); // Ambil semua ID kolom
      columnIds.forEach((columnId) => showData(columnId)); // Panggil `showData` untuk setiap kolom
    }
  }, []);

  useEffect(() => {
    if(session){
      const picInput = session.data.group !== 7 ? session.data.group : "";
      setGroupJob(picInput);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!session || !session.data) {
    return <div>Loading...</div>; // Bisa juga redirect ke halaman login
  }
  
  const widthGroupCard = session.data.group !== 7 ? '100rem' : '162rem';

  // Fungsi untuk menangani peristiwa drag and drop
  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Jika item dilepas di luar area tujuan
    if (!destination) {
      return;
    }

    // Jika sumber dan tujuan sama, tidak ada yang perlu diubah
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Ambil data kolom sumber dan tujuan
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    if (sourceColumn === destColumn) {
      // Ambil kolom yang sesuai dengan droppableId
      const column = columns[source.droppableId];

      // Salin item dari kolom
      const items = [...column.items];

      // Ambil item yang di-drag
      const [movedItem] = items.splice(source.index, 1); // Hapus item dari posisi lama


      // Masukkan item ke posisi baru
      items.splice(destination.index, 0, movedItem);

      // Update state kolom dengan urutan baru
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: items },
      });
      const arrayID = items.map(item => item.id);
      updateJobGroup(destColumn.id,arrayID)
      //UPDATE ID
    } else {
      // Pindahkan item di dalam kolom
      const sourceItems = [...sourceColumn.items];
      const [movedItem] = sourceItems.splice(source.index, 1); // Hapus item dari posisi lama

      // Jangan menambah item baru, cukup masukkan item di posisi baru dalam urutan yang benar
      const destinationItems = [...destColumn.items];
      destinationItems.splice(destination.index, 0, movedItem);

      // Update state dengan kolom yang sudah dimodifikasi
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destinationItems },
      });

      const arrayFrom = sourceItems.map(item => item.id);
      updateJobGroup(source.droppableId,arrayFrom)

      const arrayDest = destinationItems.map(item => item.id);
      updateJobGroup(destination.droppableId,arrayDest)
    }
  };

  const updateJobGroup = async (columnId,arrayID) => {
    const API_BASE_URL = process.env.REACT_APP_API_URL;
    const response = await fetch(`${API_BASE_URL}/api/updateJobGroup`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          columnId: columnId,
          arrayID:JSON.stringify(arrayID),
      }),
    });
    const data = await response.json();
    if(!response.ok){
      const messageError = `Error : ${data.error}`;
      Swal.fire({
        title: "Error",
        html: messageError,
        icon: "error"
      });
    }
  }

  const handleClose = () => {
    setShow(false)
    setModalData({
      method:'add',
      idItem:0,
      title:"",
      columnId:"",
      job: "",
      tanggal: Tanggal,
      waktu: Waktu,
      type: "Other",
      detail: "",
      groupjobid: groupjob
    })
  };

  const handleShow = (title,columnId) => {
    setShow(true)
    setModalData({
      method:'add',
      idItem:0,
      title:title,
      columnId:columnId,
      job: "",
      tanggal: Tanggal,
      waktu: Waktu,
      type: "Other",
      detail: "",
      groupjobid: groupjob,
    });
  };

  const formatDate = (originalDate) => {
    // Konversi ke objek Date
    const date = new Date(originalDate);

    // Format menjadi dd-mm-yyyy
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    return formattedDate;
  }

  const deleteJob = async (columnId, idItem) => {
    // Menampilkan konfirmasi menggunakan SweetAlert2
    let recycleBinButton = session.data.group === 7 ? true : false;
    let recycleBinText = session.data.group === 7 ? "Recycle Bin!" : "Delete";
    let permanentButton = columnId === "recycle" ? false : true;
    Swal.fire({
      title: 'Apakah anda yakin?',
      icon: 'question',
      showConfirmButton: recycleBinButton,
      showCancelButton: true,
      showDenyButton: permanentButton,  // Menambahkan tombol Deny
      confirmButtonColor: '#ff6f61d33',
      cancelButtonColor: '#bdb9b9',
      denyButtonColor: '#d33',  // Warna tombol Deny
      confirmButtonText: 'Delete Permanent!',
      denyButtonText: recycleBinText,  // Teks untuk tombol Deny
      cancelButtonText: 'Cancel',  // Teks untuk tombol Cancel
    }).then(async (result) => {
      // Jika pengguna mengonfirmasi
      let type = "recycle";
      if (result.isConfirmed) {
        type = "permanent";
      } else if(result.isDenied){
        type = "recycle";
      }else{
        type = "notselect";
      }
      
      if(type !== "notselect"){
        // Update state untuk menghapus item yang sudah dihapus
        setColumns((prevColumns) => {
          let updatedItems = [];
          let updatedColumns = { ...prevColumns };
          if (type === "recycle") {
            //dapatkan data yang dihapus
            const currentColumn = updatedColumns[columnId];
            updatedItems = currentColumn.items.find(item => item.id === idItem);
  
            //Masukkan data ke recycle bin
            const recycleBin = updatedColumns["recycle"];
            updatedItems = [...recycleBin.items, updatedItems];
  
            updatedColumns = {
              ...updatedColumns,
              recycle: {
                ...recycleBin,
                items: updatedItems,
              },
            };
            const arrayID = updatedItems.map(item => item.id);
            updateJobGroup("recycle",arrayID);
            Swal.fire({
              title: 'Success',
              html: "Berhasil memindahkan data ke Recycle Bin",
              icon: 'success',
            });
          } else if (type === "permanent") {
            const API_BASE_URL = process.env.REACT_APP_API_URL;
            // Kirim request ke backend untuk menghapus data
            fetch(`${API_BASE_URL}/api/deleteJob`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                columnId: columnId,
                idItem: idItem,
              }),
            })
              .then((response) => {
                // Memproses respons JSON
                return response.json().then((data) => ({
                  ok: response.ok,
                  data,
                }));
              })
              .then(({ ok, data }) => {
                  if (ok) {
                      Swal.fire({
                          title: 'Success',
                          html: "Data berhasil dihapus",
                          icon: 'success',
                      });
                  } else {
                      const messageError = `Error: ${data.error || 'Unknown error'}`;
                      Swal.fire({
                          title: 'Error',
                          html: messageError,
                          icon: 'error',
                      });
                  }
              })
              .catch((error) => {
                  // Menangani kesalahan saat fetch gagal (misalnya, masalah jaringan)
                  Swal.fire({
                      title: 'Error',
                      html: `Request failed: ${error.message}`,
                      icon: 'error',
                  });
              });
          }
  
          const currentColumn = updatedColumns[columnId];
          updatedItems = currentColumn.items.filter(item => item.id !== idItem);
  
          updatedColumns = {
            ...updatedColumns,
            [columnId]: {
              ...currentColumn,
              items: updatedItems,
            },
          };
          
          const arrayID = updatedItems.map(item => item.id);
          updateJobGroup(columnId,arrayID);
  
          return updatedColumns;
  
        });
      }
    });
  };

  const BadgeType = (type) => {
    let badge = "";
    if(type === "Meeting"){
      badge = "badge bg-primary";
    }else if(type === "Discuss"){
      badge = "badge bg-info text-dark";
    }else if(type === "Review"){
      badge = "badge bg-warning text-dark";
    }else if(type === "Approval"){
      badge = "badge bg-secondary";
    }else{
      badge = "badge bg-danger";
    }
    const result = <span className={badge} style={{fontSize:'7pt'}}>{type}</span>;
    return result;
  }

  const editData = (title,columnId,data) => {
    handleShow(title,columnId);
    const dateNow = new Date(data.target);
    const Tanggal = `${dateNow.getFullYear()}-${String(dateNow.getMonth() + 1).padStart(2, "0")}-${String(dateNow.getDate()).padStart(2, "0")}`;
    const Waktu = dateNow.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});
    setModalData({
      method:'edit',
      idItem:data.id,
      title:title,
      columnId:columnId,
      job: data.job,
      tanggal: Tanggal,
      waktu: Waktu,
      type: data.type,
      detail: data.detail,
      groupjobid: data.groupjobid,
    });
  }

  const completeJob = async (columnId, idItem) => {
    setColumns((prevColumns) => {
      let updatedColumns = { ...prevColumns };
      
      // Pastikan columnId ada dan tidak null atau undefined
      const currentColumn = updatedColumns[columnId];
      if (!currentColumn) {
        console.error(`Column with id "${columnId}" not found.`);
        return prevColumns;
      }
  
      // Dapatkan item yang akan dipindahkan ke "complete"
      let updatedItemsComplete = currentColumn.items.find(item => item.id === idItem);
      if (!updatedItemsComplete) {
        console.error(`Item with id "${idItem}" not found in column "${columnId}".`);
        return prevColumns;
      }
  
      // Pastikan column "complete" ada
      const Complete = updatedColumns["complete"];
      if (!Complete) {
        console.error('Complete column not found.');
        return prevColumns;
      }
  
      // Masukkan item ke dalam "complete"
      updatedItemsComplete = [...Complete.items, updatedItemsComplete];
      updatedColumns = {
        ...updatedColumns,
        complete: {
          ...Complete,
          items: updatedItemsComplete,
        },
      };
  
      // Filter item yang dipindahkan
      const updatedItems = currentColumn.items.filter(item => item.id !== idItem);
      updatedColumns = {
        ...updatedColumns,
        [columnId]: {
          ...currentColumn,
          items: updatedItems,
        },
      };
  
      const arrayIDComplete = updatedItemsComplete.map(item => item.id);
      const arrayID = updatedItems.map(item => item.id);
  
      updateJobGroup("complete", arrayIDComplete); // Uncomment if needed
      updateJobGroup(columnId, arrayID); // Uncomment if needed
  
      Swal.fire({
        title: 'Success',
        html: "Berhasil memindahkan data ke Complete",
        icon: 'success',
      });
  
      return updatedColumns; // pastikan perubahan kolom disertakan
    });
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className='pb-2 pt-3 scrollRoomCard' style={{ paddingLeft: '1rem' }}>
          <div className="row" style={{ width: widthGroupCard }}>
            {Object.keys(columns).map((columnId) => {
              // Menyaring kolom yang tidak perlu dirender
              if (session.data.group !== 7 && (columnId === "recycle" || columnId === "complete")) {
                return null; // Jika kondisi terpenuhi, skip render
              }
  
              const column = columns[columnId];
              return (
                <div key={column.id} className="col">
                  <center><h5 className='text-light'>{column.title}</h5></center>
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div className='card p-1 ps-0 pe-0 pt-0 border-0' style={{ minHeight: '38rem', backgroundColor: '#253253' }}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <div className='scrollRoomCard' style={{ maxHeight: '34rem', overflow: 'hidden auto' }}>
                          {column.items.map((item, index) => {
                            // Menyaring item berdasarkan kondisi
                            if (session.data.group !== 7 && session.data.group !== item.groupjobid) {
                              return null; // Tidak merender item jika tidak memenuhi kondisi
                            }
  
                            return (
                              <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      padding: '10px',
                                      marginBottom: '4px',
                                      backgroundColor: '#49374C',
                                      cursor: 'move',
                                    }}
                                  >
                                    <div className='row'>
                                      <div className='col-6 d-flex align-items-start'>{BadgeType(item.type)}</div>
                                      <div className='col-6 text-end' style={{ fontSize: '7pt', color: '#adacac' }}>
                                        Target : {formatDate(item.target)}
                                      </div>
                                    </div>
                                    <div className='mb-1 mt-2'>
                                      <b>[{item.groupjob}]</b> {item.job}
                                    </div>
                                    <div className='row' style={{ position: 'relative' }}>
                                      <div className='col-6' style={{ fontSize: '8pt', color: '#adacac' }}>
                                        {formatDate(item.created)}<br />
                                        {item.inputer}
                                      </div>
                                      <div className='col-6'>
                                        <div style={{ position: "absolute", bottom: '0px', right: '10px' }}>
                                          {
                                            column.id !== "recycle" && column.id !== "complete" && session.data.group === 7 ? (
                                              <Button variant='success btn-sm' style={{ marginLeft: '3px' }} title='Complete Job' onClick={() => completeJob(column.id, item.id)}>
                                                <i className="fas fa-check"></i>
                                              </Button>
                                            ) : ""
                                          }
                                          {
                                            column.id !== "recycle" ? (
                                              <Button variant='primary btn-sm' style={{ marginLeft: '3px' }} title='Edit Job' onClick={() => editData(column.title, column.id, item)}>
                                                <i className="fas fa-pencil-alt"></i>
                                              </Button>
                                            ) : ""
                                          }
                                          <Button variant='danger btn-sm' style={{ marginLeft: '3px' }} title='Hapus Job' onClick={() => deleteJob(column.id, item.id)}>
                                            <i className='fas fa-trash-alt'></i>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                        <div className='bg-secondary w-100 p-2 text-end' style={{ position: 'absolute', bottom: '0px', right: '0px', backgroundColor: 'rgb(209, 207, 207)' }}>
                          <Button variant="primary" onClick={() => handleShow(column.title, column.id)}>Tambah</Button>
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>
      <ModalInput show={show} handleClose={handleClose} modalData={modalData} showData={showData} />
    </>
  );  
}

export default Home;