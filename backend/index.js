import express from "express";
import mysql from "mysql";

const app = express();
const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"@Admin021867",
    database:"test"
});

app.get("/", (req,res)=>{
    res.json("Hello this is the backend");
})

app.get("/books", (req, res)=>{
    const query = "SELECT * FROM books";
    db.query(query, (err, data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.listen(8800, ()=>{
    console.log("Connected to backend!");
})