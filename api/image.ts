import express, { json } from "express";
import mysql from "mysql";
import { ImageGetRequest } from "./model/ImageGetRequest";

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


//ค้นหา image ทั้งหมด
router.get("/", (req, res) => {
    conn.query('select * from Image ORDER BY rate DESC', (err, result, fields) => {
        res.json(result);
        console.log('success');
    });
});

//ค้นหา image ทั้งหมด
router.get("/shuffle", (req, res) => {
  conn.query('select * from Image ORDER BY RAND()', (err, result, fields) => {
      res.json(result);
      console.log('shuffle success');
  });
});


//ค้นหา image ทั้งหมดจากไอดี
router.get("/:id", (req,res) => {
  conn.query("select * from Image where LID = ?",
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



//ค้นหา image ทั้งหมดจาก uid ของคนนั้น
router.get("/UID/:id", (req,res) => {
  conn.query("select * from Image where uid = ?",
  [req.params.id], (err , result) => {
      if (err) {
          res.status(400).json(err);
      }
      else{
          res.status(200).json(result);
      }
  });
});


// //เพิ่มรูปภาพ
// router.post("/addimage/:id", (req, res) => {
//     let id = +req.params.id;
//     let addimage: ImageGetRequest = req.body;
//     console.log(addimage)
//     let sql =
//       "INSERT INTO `Image`(`img`,`name`,`amount`,`uid`) VALUES (?,?,?,?)";
//     sql = mysql.format(sql, [
//         addimage.img,
//         addimage.name,
//         addimage.amount,
//         id
//     ]);
//     conn.query(sql, (err, result) => {
//       if (err) throw err;
//       res
//         .status(201)
//         .json({ affected_row: result.affectedRows, last_idx: result.insertId });
//     });
//   });

  //เพิ่มรูปภาพ
router.post("/addimage/:id", (req, res) => {
  let id = +req.params.id;
  let addimage: ImageGetRequest = req.body;
  console.log(addimage)
  let sql =
    "INSERT INTO `Image`(`img`,`name`,`uid`) VALUES (?,?,?)";
  sql = mysql.format(sql, [
      addimage.img,
      addimage.name,
      id
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(201)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

//แก้ไขรูปภาพจาก Lid
router.put("/:id", (req, res) => {
    let id = +req.params.id;
    let updateimage: ImageGetRequest = req.body;
    let sql =
      "update  `Image` set `img`=?, `name`=?  where `LID`=?";
    sql = mysql.format(sql, [
        updateimage.img,
        updateimage.name,
        id
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows });
    });
  });


   //ลบรูปภาพจาก id
router.delete("/delete/:id", (req, res) => {
    let id = +req.params.id;
    conn.query("delete from Image where lid = ?", [id], (err, result) => {
       if (err) throw err;
       res
         .status(200)
         .json({ affected_row: result.affectedRows });
    });
  });