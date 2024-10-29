import express, { json } from "express";
import mysql from "mysql";
import { VoteGetRequest } from "./model/VoteGetRequest";
import { EloRateRequest } from "./model/EloRateRequest";

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



//ค้นหา Vote ทั้งหมด
router.get("/", (req, res) => {
  conn.query('select * from Vote', (err, result, fields) => {
    res.json(result);
    console.log('success');
  });
});

//ค้นหา Vote ทั้งหมด ของ ID นั้นๆ โดยแยกเป็น ล่าสุดของแต่ละวัน
router.get("/:LID", (req, res) => {
  let sql = "SELECT MAX(latestScore) AS latestScore, LID, DATE_FORMAT(DATE(date), '%Y-%m-%d') AS voting_date FROM `Vote` WHERE LID = ? AND DATE(date) BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() GROUP BY voting_date, LID ORDER BY voting_date DESC";
  sql = mysql.format(sql, [req.params.LID]);
  conn.query(sql, (err, result) => {
    res.json(result);
    console.log('success');
  });
});


//เพิ่ม vote รูปภาพ
// router.post("/addvote", (req, res) => {
//   let addVote: VoteGetRequest = req.body;
//   console.log(addVote)
//   let sql =
//     "INSERT INTO `Vote`(`score`,`datetime`,`result`) VALUES (?,?,?)";
//   sql = mysql.format(sql, [
//     addVote.score,
//     new Date(),
//     addVote.result,
//   ]);
//   conn.query(sql, (err, result) => {
//     if (err) throw err;
//     res
//       .status(201)
//       .json({ affected_row: result.affectedRows, last_idx: result.insertId });
//   });
// });

//แก้ไข Vote จากไอดี
// router.put("/:id", (req, res) => {
//   let id = +req.params.id;
//   let updatevote: VoteGetRequest = req.body;
//   let sql =
//     "update  `Vote` set `score`=?, `result`=? where `vid`=?";
//   sql = mysql.format(sql, [
//     updatevote.score,
//     updatevote.result,
//     id
//   ]);
//   conn.query(sql, (err, result) => {
//     if (err) throw err;
//     res
//       .status(201)
//       .json({ affected_row: result.affectedRows });
//   });
// });


//ลบ vote จาก id
// router.delete("/delete/:id", (req, res) => {
//   let id = +req.params.id;
//   conn.query("delete from Vote where vid = ?", [id], (err, result) => {
//     if (err) throw err;
//     res
//       .status(200)
//       .json({ affected_row: result.affectedRows });
//   });
// });

// ELO Rating
router.post("/addvote/elo", (req, res) => {
  let addVote: EloRateRequest = req.body;
  const aID = addVote.A;
  const bID = addVote.B;
  const K = 30;
  const Ra = addVote.Ra;
  const Rb = addVote.Rb;
  const D = addVote.aWin;
  let resultA = 0;
  let resultB = 0;
  if (addVote.aWin) {
    resultA = 1;
  } else {
    resultB = 1;
  }
  console.log(addVote)

  //EloRating 
  let UpdateRate = EloRating(Ra, Rb, K, D)
  const RaNew = UpdateRate.RaNew
  const RbNew = UpdateRate.RbNew

  const RaChange = RaNew - Ra;
  const RbChange = RbNew - Rb;
  console.log("Ca: " + RaChange);
  console.log("Cb: " + RbChange);

  let sqlV =
    "INSERT INTO `Vote` (`VID`, `uid`, `LID`, `result`, `date`, `scoreChange`, `latestScore`) VALUES (NULL, ?, ?, ?, CURRENT_TIME(), ?, ?), (NULL, ?, ?, ?, CURRENT_TIME(), ?, ?);";
  sqlV = mysql.format(sqlV, [
    addVote.uid,
    addVote.A,
    resultA,
    RaChange,
    RaNew,
    addVote.uid,
    addVote.B,
    resultB,
    RbChange,
    RbNew
  ]);
  conn.query(sqlV, (err, result) => {
    if (err) {
      console.error("Error inserting into Vote table:", err);
      return res.status(500).json({ error: "Error inserting into Vote table" });
    }
    console.log("Inserted into Vote table successfully");
  });

  let sqlU1 = "UPDATE `Image` SET `rate` = ? WHERE `LID` = ?";
  let sqlU2 = "UPDATE `Image` SET `rate` = ? WHERE `LID` = ?";
  let values1 = [RaNew, aID];
  let values2 = [RbNew, bID];

  conn.query(sqlU1, values1, (err, result) => {
    if (err) {
      console.error("Error updating Image table (1):", err);
      return res.status(500).json({ error: "Error updating Image table" });
    }
    console.log("Updated Image table (1) successfully");
  });

  conn.query(sqlU2, values2, (err, result) => {
    if (err) {
      console.error("Error updating Image table (2):", err);
      return res.status(500).json({ error: "Error updating Image table" });
    }
    console.log("Updated Image table (2) successfully");
  });

  const resData = {
    "RaNew": Ra,
    "RbNew": Rb,
    "RaChange": RaChange,
    "RbChange": RbChange
  }
  res
    .status(200)
    .json(resData);

});
// Pre Elo
function Probability(rating1: number, rating2: number) {
  return (
    (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400))
  );
}


// Elo
function EloRating(Ra: number, Rb: number, K: number, d: boolean) {
  // To calculate the Winning
  // Probability of Player B
  let Pb = Probability(Ra, Rb);

  // To calculate the Winning
  // Probability of Player A
  let Pa = Probability(Rb, Ra);

  // Case 1 When Player A wins
  // Updating the Elo Ratings
  if (d === true) {
    Ra = Ra + K * (1 - Pa);
    Rb = Rb + K * (0 - Pb);
  }

  // Case 2 When Player B wins
  // Updating the Elo Ratings
  else {
    Ra = Ra + K * (0 - Pa);
    Rb = Rb + K * (1 - Pb);
  }

  let RaNew = Math.round(Ra * 1000000.0) / 1000000.0;
  let RbNew = Math.round(Rb * 1000000.0) / 1000000.0;
  console.log("Updated Ratings:-");
  console.log(
    "Ra = " +
    Math.round(Ra * 1000000.0) / 1000000.0 +
    " Rb = " +
    Math.round(Rb * 1000000.0) / 1000000.0
  );

  return {
    "RaNew": Ra,
    "RbNew": Rb
  }
}




