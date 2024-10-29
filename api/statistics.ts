import express, { json } from "express";
import mysql from "mysql";

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


router.get("/", (req, res) => {
    conn.query('select * from User', (err, result, fields) => {
        res.json(result);
        console.log('success');
    });
});