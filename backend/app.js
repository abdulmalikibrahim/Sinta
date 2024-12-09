const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { group } = require('console');
const { isPromise } = require('util/types');

let tokens = []; // Simpan token sementara, gunakan Redis/DB untuk implementasi produksi

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Koneksi ke Database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Ganti dengan username MySQL Anda
    password: 'Optimissukses100%+++', // Ganti dengan password MySQL Anda
    database: 'working_list', // Ganti dengan nama database Anda
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi database gagal:', err);
    } else {
        console.log('Terhubung ke database MySQL.');
    }
});

function convertDate(date = null){
    const currDate = !date ? new Date() : new Date(date);
    const currYear = currDate.getFullYear();
    const currmonth = currDate.getMonth() + 1;
    const currMonth = String(currmonth).padStart(2,"0");
    const currDay = String(currDate.getDate()).padStart(2,"0");
    
    const currTime = currDate.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});

    const tanggal = `${currYear}-${currMonth}-${currDay}`;
    return {tanggal:tanggal, time:currTime};
}

// Middleware untuk membuat token
app.get('/api/getToken', (req, res) => {
    const token = crypto.randomBytes(32).toString('hex'); // Buat token
    tokens.push(token); // Simpan token ke dalam array (atau database di implementasi nyata)
    res.json({ token });
});

// Middleware untuk validasi token
const validateToken = (req, res, next) => {
    const token = req.headers['x-csrf-token'];
    if (!token || !tokens.includes(token)) {
        return res.status(403).json({ error: 'Invalid or missing token' });
    }
    // Hapus token setelah digunakan (optional untuk keamanan tambahan)
    tokens = tokens.filter((t) => t !== token);
    next();
};

// Endpoint untuk menyimpan data ke database
app.post('/api/ListJob', async (req, res) => {
    const { columnId, groupjob } = req.body;

    if (!columnId || !groupjob) {
        return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
    }

    try {
        const query = 'SELECT ?? FROM joblist_group WHERE id = ?';
        const [groupResult] = await new Promise((resolve, reject) => {
            db.query(query, [columnId,1], (err, result) => {
                if (err) {
                    console.error('Error saat mendapatkan data:', err);
                    return reject(err)
                }
                resolve(result)
            });
        })

        // Parsing hasil query pertama
        const data = JSON.parse(groupResult[columnId] || "[]");

        // Menjalankan query kedua untuk setiap ID dalam data
        const promises = data.map(id => {
            return new Promise((resolve, reject) => {
                const baseQuery = 'SELECT joblist.*, joblist.groupjob as groupjobid,user.nama as inputer,`group`.code as groupjob FROM joblist LEFT JOIN user ON user.id = joblist.inputer LEFT JOIN `group` ON `group`.id = joblist.groupjob WHERE joblist.id = ?';
                db.query(baseQuery, [id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result[0]);
                });
            });
        });

        // Menunggu semua query selesai
        const resultData = await Promise.all(promises);
        const finalResult = resultData.filter(item => item !== undefined);

        // Mengembalikan respons dengan data yang telah diproses
        res.status(201).json({ statusCode: 201, data: finalResult });
    } catch (error) {
        res.status(500).json({ statusCode:500 , data:error });
    }
});

// Endpoint untuk menyimpan data ke database
app.get('/api/getGroupJob', async (req, res) => {
    try {
        const query = 'SELECT * FROM `group` WHERE id != 0';
        const groupResult = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) {
                    console.error('Error saat mendapatkan data:', err);
                    return reject(err);
                }
                resolve(result);
            });
        });
        // Mengembalikan respons dengan data yang telah diproses
        res.status(200).json({ statusCode: 200, data: groupResult });
    } catch (error) {
        res.status(500).json({ statusCode:500 , data:error });
    }
});

// Endpoint untuk menyimpan data ke database
app.post('/api/getUser', async (req, res) => {
    const { groupID } = req.body

    if(!groupID){
        return res.status(400).json({error : "Mohon isi data dengan lengkap"})
    }

    try {
        const query = 'SELECT * FROM `user` WHERE `group` = ?';
        const groupResult = await new Promise((resolve, reject) => {
            db.query(query, [groupID], (err, result) => {
                if (err) {
                    console.error('Error saat mendapatkan data:', err);
                    return reject(err);
                }
                resolve(result);
            });
        });
        // Mengembalikan respons dengan data yang telah diproses
        res.status(200).json({ statusCode: 200, data: groupResult });
    } catch (error) {
        res.status(500).json({ statusCode:500 , data:error });
    }
});

// Endpoint untuk menyimpan data ke database
app.post('/api/addJob', (req, res) => {
    const { columnId, job, date, time, type, detail, inputer, groupjob } = req.body;
    const target = date+" "+time;
    if (!columnId || !job || !date || !time || !type || !inputer || !groupjob) {
        return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
    }

    const query = 'INSERT INTO joblist (job, target, type, detail, inputer, groupjob) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [job, target, type, detail, inputer, groupjob], (err, result) => {
        if (err) {
            console.error('Error saat menyimpan data:', err);
            return res.status(500).json({ error: 'Database error'+err });
        }

        const insertId = result.insertId;

        //GET DATA JSON joblist_group
        const queryColumn = 'SELECT '+columnId+' FROM joblist_group WHERE id = "1"';
        db.query(queryColumn,(err, result) => {
            if(err){
                console.error("Error Check JobList : ",err);
                return res.status(500).json({error: "Database error"});
            }

            try {
                const dataColumn = JSON.parse(result[0][columnId] || "[]");
                dataColumn.push(insertId);
                const dataUpdate = JSON.stringify(dataColumn);

                //UPDATE NEW JOBLIST
                const query = 'UPDATE joblist_group SET '+columnId+'="'+dataUpdate+'" WHERE id = "1"';
                db.query(query, (err, result) => {
                    if (err) {
                        console.error('Error saat menyimpan data:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.status(201).json({ message: 'User added successfully', id: result.insertId });
                });

            } catch (e) {
                return res.status(500).json({error: "Invalid JSON format in database"});
            }
        });

    });

});

// Endpoint untuk menyimpan data ke database
app.post('/api/updateJob', (req, res) => {
    const { idItem, columnId, job, date, time, type, detail, groupjob, inputer } = req.body;
    const target = date+" "+time;
    if (!idItem || !columnId || !job || !date || !time || !type || !groupjob || !inputer) {
        return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
    }

    const query = 'UPDATE joblist SET job=?, target=?, type=?, detail=?, groupjob=?, inputer=? WHERE id = ?';
    db.query(query, [job, target, type, detail, groupjob, inputer, idItem], (err, result) => {
        if (err) {
            console.error('Error saat menyimpan data:', err);
            return res.status(500).json({ error: 'Database error'+err });
        }
        res.status(201).json({ message: 'User updated successfully', id: result.insertId });
    });

});

app.post('/api/updateJobGroup', (req, res) => {
    const { arrayID, columnId } = req.body;
    if(!arrayID || !columnId){
        return res.status(500).json({error: "Data tidak lengkap"});
    }
    
    const query = 'UPDATE joblist_group SET ?? = ? WHERE id = "1"';
    db.query(query, [columnId, arrayID], (err,result) => {
        if(err){
            console.error("Error saat menyimpan data", err);
            return res.status(500).json({error: "Database error"})
        }
        res.status(200).json({message:"Data berhasil update"})
    })
});

app.post('/api/deleteJob', (req, res) => {
    const { idItem, columnId } = req.body;
    if(!idItem || !columnId){
        return res.status(500).json({error: "Data tidak lengkap"});
    }

    const query = 'DELETE FROM joblist WHERE id = ?';
    db.query(query, [idItem], (err,result) => {
        if(err){
            console.error("Error saat menyimpan data", err);
            return res.status(500).json({error: "Database error"})
        }
    })
    res.status(200).json({message:"Data berhasil update"})
});

app.post('/api/validateLogin', (req, res) => {
    const {username,password} = req.body;

    const query = "SELECT `id`,`group`,`password` FROM user WHERE username = ?";
    db.query(query,[username],(err,resultDB) => {
        if(err){
            console.error("Database Error",err);
            res.status(500).json({statusCode:500,data:{message:"Database error : "+err}});
            return;
        }

        if(resultDB.length === 0){
            res.status(500).json({statusCode:500,data:{message:"Username tidak ditemukan"}});
            return;
        }
        const passwordCheck = resultDB[0].password;
        //VALIDASI PASSWORD
        bcrypt.compare(password,passwordCheck,(err, valid) => {
            if(err){
                res.status(500).json({statusCode:500,data:{message:"Internal server error"}});
                return;
            }

            if(valid){
                res.status(200).json({statusCode:200,data:{message:"Password Benar",id:resultDB[0].id,group:resultDB[0].group}});
            }else{
                res.status(401).json({statusCode:401,data:{message:"Password Salah"}});
            }
        })
    });
});

app.post('/api/ListReoccuring', async (req, res) => {
    const { type, idGroup } = req.body;

    if (!idGroup) {
        return res.status(400).json({ error: 'ID Group tidak boleh kosong' });
    }

    try {
        const dateTime = convertDate();
        const tanggal = `%${dateTime.tanggal}%`;
        
        const query = idGroup === 7 ? 
        
        'SELECT rj.*,user.nama,`group`.code,`group`.name as groupname FROM reoccuring_job as rj LEFT JOIN user ON user.id = rj.user LEFT JOIN `group` ON `group`.id = rj.groupjob WHERE (rj.tipe = ? AND created LIKE ?) OR (rj.tipe = ? AND status = ?)' : 
        
        'SELECT rj.*,user.nama,`group`.code,`group`.name as groupname FROM reoccuring_job as rj LEFT JOIN user ON user.id = rj.user LEFT JOIN `group` ON `group`.id = rj.groupjob WHERE (rj.tipe = ? AND created LIKE ? AND rj.groupjob = ?) OR (rj.tipe = ? AND status = ? AND rj.groupjob = ?)';

        const values = idGroup === 7 ? [type,tanggal,type,0] : [type,tanggal,idGroup,type,0,idGroup];
        const dataResult = await new Promise((resolve, reject) => {
            db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Error saat mendapatkan data:', err);
                    return reject(err);
                }
                resolve(result);
            });
        });
        // Mengembalikan respons dengan data yang telah diproses
        res.status(200).json({ statusCode: 200, data: dataResult });
    } catch (error) {
        res.status(500).json({ statusCode:500 , data:error });
    }
});

app.post('/api/updateReoccuringJob', async (req,res) => {
    const { taskId, status } = req.body;

    if(!taskId){
        return res.status(400).json({statusCode:400, data:{message: "ID task tidak boleh kosong"}});
    }

    if(typeof taskId !== 'number'){
        return res.status(400).json({statusCode:400, data:{message: "ID task harus angka"}});
    }

    try {
        const dateTime = convertDate();
        const CurrDateTime = status > 0 ? `${dateTime.tanggal} ${dateTime.time}` : null;
        const query = 'UPDATE reoccuring_job SET status = ?, date_finish = ? WHERE id = ?';
        db.query(query, [status,CurrDateTime,taskId], (err,result) => {
            if(err){
                return res.status(500).json({statusCode:500, data:{message: "Database error", error: err}});
            }

            return res.status(200).json({statusCode:200, data:{message: "Data berhasil diupdate"}});
        })
    } catch (error) {
        return res.status(500).json({statusCode:500, data:{message: error.message}});
    }
})

app.post('/api/ListReoccuringBase', async (req, res) => {
    const { type, idGroup } = req.body;

    if (!idGroup) {
        return res.status(400).json({ error: 'ID Group tidak boleh kosong' });
    }

    try {
        const baseQuery = 'SELECT rjb.*,user.nama,`group`.code,`group`.name as groupname FROM reoccuring_job_base as rjb LEFT JOIN user ON user.id = rjb.user LEFT JOIN `group` ON `group`.id = rjb.groupjob WHERE rjb.tipe = ?';
        const query = idGroup === 7 ? baseQuery : baseQuery + ' AND rjb.groupjob = ?';
        const values = idGroup === 7 ? [type] : [type,idGroup];
        const dataResult = await new Promise((resolve, reject) => {
            db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Error saat mendapatkan data:', err);
                    return reject(err);
                }
                resolve(result);
            });
        });
        // Mengembalikan respons dengan data yang telah diproses
        res.status(200).json({ statusCode: 200, data: dataResult });
    } catch (error) {
        res.status(500).json({ statusCode:500 , data:error });
    }
});

// Endpoint untuk menyimpan data ke database
app.post('/api/updateReoccuringBase', (req, res) => {
    const { idEdit,user,groupJob,job,jobType,rDay,rDate1,rDate2 } = req.body;
    if (!user || !groupJob || !job || !jobType || !idEdit) {
        return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
    }

    let query = 'UPDATE reoccuring_job_base SET user=?, groupjob=?, job=?, tipe=?,reoccuring_tipe=? WHERE id=?';
    let valueInput = [user,groupJob,job,jobType,"Daily",idEdit];
    if(jobType === "Weekly Task"){
        if(!rDay){
            return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
        }
        query = 'UPDATE reoccuring_job_base SET user=?, groupjob=?, job=?, tipe=?,reoccuring_tipe=?, reoccuring_unset=? WHERE id=?';
        valueInput = [user,groupJob,job,jobType,"Day",rDay,idEdit];
    }else if(jobType === "Bi Weekly Task"){
        if(!rDate1 || !rDate2){
            return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
        }
        const reoccuring_unset = rDate1+","+rDate2;
        query = 'UPDATE reoccuring_job_base SET user=?, groupjob=?, job=?, tipe=?,reoccuring_tipe=?, reoccuring_unset=? WHERE id=?';
        valueInput = [user,groupJob,job,jobType,"Date",reoccuring_unset,idEdit];
    }else if(jobType === "Monthly Task"){
        if(!rDate1){
            return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
        }
        query = 'UPDATE reoccuring_job_base SET user=?, groupjob=?, job=?, tipe=?,reoccuring_tipe=?, reoccuring_unset=? WHERE id=?';
        valueInput = [user,groupJob,job,jobType,"Date",rDate1,idEdit];
    }

    db.query(query, valueInput, (err, result) => {
        if (err) {
            console.error('Error saat menyimpan data:', err);
            return res.status(500).json({ error: 'Database error'+err });
        }

        const insertId = result.insertId;
        return res.status(200).json({ message: 'Data updated successfully', id: insertId });
    });
});

// Endpoint untuk menyimpan data ke database
app.post('/api/addReoccuringBase', (req, res) => {
    const { user,groupJob,job,jobType,rDay,rDate1,rDate2 } = req.body;
    if (!user || !groupJob || !job || !jobType) {
        return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
    }

    let query = 'INSERT INTO reoccuring_job_base (user,groupjob,job,tipe,reoccuring_tipe) VALUES (?, ?, ?, ?, ?)';
    let valueInput = [user,groupJob,job,jobType,"Daily"];
    if(jobType === "Weekly Task"){
        if(!rDay){
            return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
        }
        query = 'INSERT INTO reoccuring_job_base (user,groupjob,job,tipe,reoccuring_tipe,reoccuring_unset) VALUES (?, ?, ?, ?, ?, ?)';
        valueInput = [user,groupJob,job,jobType,"Day",rDay];
    }else if(jobType === "Bi Weekly Task"){
        if(!rDate1 || !rDate2){
            return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
        }
        const reoccuring_unset = rDate1+","+rDate2;
        query = 'INSERT INTO reoccuring_job_base (user,groupjob,job,tipe,reoccuring_tipe,reoccuring_unset) VALUES (?, ?, ?, ?, ?, ?)';
        valueInput = [user,groupJob,job,jobType,"Date",reoccuring_unset];
    }else if(jobType === "Monthly Task"){
        if(!rDate1){
            return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
        }
        query = 'INSERT INTO reoccuring_job_base (user,groupjob,job,tipe,reoccuring_tipe,reoccuring_unset) VALUES (?, ?, ?, ?, ?, ?)';
        valueInput = [user,groupJob,job,jobType,"Date",rDate1];
    }

    // Query untuk menambahkan data baru
    
    db.query(query, valueInput, (err, result) => {
        if (err) {
            console.error('Error saat menyimpan data:', err);
            return res.status(500).json({ error: 'Database error'+err });
        }
        
        const addQuery = 'INSERT INTO reoccuring_job (user, groupjob, job, tipe, status) VALUES (?, ?, ?, ?, ?)';
        db.query(addQuery, [user, groupJob, job, jobType, 0], (err, result) => {
            if (err) {
                console.error('Error saat menambah data:', err);
                return reject(err);
            }
        });

        const insertId = result.insertId;
        return res.status(201).json({ message: 'Data added successfully', id: insertId });
    });
});

// Endpoint untuk menyimpan data ke database
app.post('/api/deleteReoccuringBase', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Mohon isi data dengan lengkap' });
    }

    const query = 'DELETE FROM reoccuring_job_base WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error saat menghapus data:', err);
            return res.status(500).json({ error: 'Database error'+err });
        }

        return res.status(200).json({ message: 'Data deleted successfully' });
    });
});

// Endpoint untuk menyimpan data ke database
app.get('/api/reoccuringNewTask', async(req, res) => {
    try {
        const baseQuery = 'SELECT * FROM reoccuring_job_base WHERE tipe != ""';
        const dataResult = await new Promise((resolve, reject) => {
            db.query(baseQuery, (err, result) => {
                if (err) {
                    console.error('Error saat mendapatkan data:', err);
                    return reject(err);
                }
                resolve(result);
            });
        });
        
        for (const e of dataResult) {
            if (e.reoccuring_tipe === "Day") {
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const today = new Date();
                const dayName = days[today.getDay()];

                // Skip iterasi jika hari sama
                if (dayName !== e.reoccuring_unset) {
                    continue;
                }
            }

            if(e.reoccuring_tipe === "Date"){
                const today = new Date();
                const currentDate = today.getDate(); // Mengembalikan angka tanggal (1-31)

                const tanggalUnset = e.reoccuring_unset;
                const dateSplit = tanggalUnset.split(",");
                if(dateSplit > 1){
                    if(currentDate !== dateSplit[0] || currentDate !== dateSplit[1]){
                        continue;
                    }
                }else{
                    if(currentDate !== tanggalUnset){
                        continue;
                    }
                }
            }

            // Query untuk menambahkan data baru
            const addQuery = 'INSERT INTO reoccuring_job (user, groupjob, job, tipe, status) VALUES (?, ?, ?, ?, ?)';
            await new Promise((resolve, reject) => {
                db.query(addQuery, [e.user, e.groupjob, e.job, e.tipe, 0], (err, result) => {
                    if (err) {
                        console.error('Error saat menambah data:', err);
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        }
        // Mengembalikan respons dengan data yang telah diproses
        res.status(200).json({ statusCode: 200, data: {message:"Sukses reset reoccuring job"} });
    } catch (error) {
        res.status(500).json({ statusCode:500 , data:error });
    }
});

app.post('/api/getTask', async (req,res) => {
    const { type, filter } = req.body;

    try {
        const arrayType = ["Daily Task","Weekly Task","Bi Weekly Task","Monthly Task"];
        let query = "SELECT COUNT(id) as total FROM reoccuring_job WHERE tipe = ? AND status = ?";
        if(filter === "group"){
            query = "SELECT COUNT(id) as total,groupjob FROM reoccuring_job WHERE tipe = ? AND status = ? GROUP BY groupjob";
        }
        const loopData = arrayType.map((element) => {
            return new Promise((resolve, reject) => {
                const values = type === "Complete" ? [element,1] : [element,0];
                db.query(query, values, (error, result) => {
                    if(error){
                        return reject(error)
                    }
                    let newElement = element.replaceAll(" ","")
                    newElement = newElement.replaceAll("Task","")
                    resolve({[newElement] : result})
                })
            });
        })
        const finalResult = await Promise.all(loopData);
        return res.status(200).json({statusCode:200, data:finalResult});
    } catch (error) {
        return res.status(500).json({statusCode:500, data:error});
    }

})


// Jalankan server
app.listen(5000, () => {
    console.log('Server berjalan di http://localhost:5000');
});