import express, { json } from "express";
import mysql from "mysql";
import { UserGetRequest } from "./model/UserGetRequest";

export const conn = mysql.createPool({
    // connectionLimit: 10,
    // host: "sql6.freemysqlhosting.net",
    // user: "sql6688515",
    // password: "M2fmddayIi",
    // database: "sql6688515",

    connectionLimit: 10,
    host: "202.28.34.197",
    user: "web65_64011212155",
    password: "64011212155@csmsu",
    database: "web65_64011212155",
});

export const router = express.Router();

router.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// router.get("/", (req, res) => {
//     res.send("Get in trip.ts");
//   });



// เช็คlogin
router.get("/checklog", (req, res) => {

    conn.query(
        'select UID from User where username like ? AND password like ?',
        [req.query.username, req.query.password],
        (err, result, fields) => {
            if (err) {
                res.status(500).json({ "error": "Internal Server Error" });
                return;
            }

            if(result.length > 0){

                console.log("Success");
                res.status(200).json({"login": "true","result":result[0]});
            }else{
                res.status(200).json({"login": "false"});
            }

        }
    );
});

//สมัครสมาชิก
router.post("/addmember", (req, res) => {
    let adduser: UserGetRequest = req.body;
    console.log(adduser)
    let sql =
      "INSERT INTO `User`(`username`,`password`,`name`) VALUES (?,?,?)";
    sql = mysql.format(sql, [
        adduser.username,
        adduser.password,
        adduser.name,
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });

//ค้นหา user ทั้งหมด
router.get("/", (req, res) => {
    conn.query('select * from User', (err, result, fields) => {
        res.json(result);
        console.log('success');
    });
});


//ค้นหา user จาก id
router.get("/:id", (req,res) => {
    conn.query("select * from User where UID = ?",
    [req.params.id], (err , result) => {
        if (err) {
            res.status(400).json(err);
        }
        else{
            res.status(200).json(result);
        }
    });
    // res.send('Call GET in trip.ts with ' + req.params.id);
});

//แก้ไขโปรไฟล์จากไอดี
router.put("/:id", (req, res) => {
    let id = +req.params.id;
    let updateuser: UserGetRequest = req.body;
    let sql =
      "update  `User` set `username`=?, `password`=?, `name`=?, `avatar`=? where `UID`=?";
    sql = mysql.format(sql, [
        updateuser.username,
        updateuser.password,
        updateuser.name,
        updateuser.avatar,
        id
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows });
    });
  });

