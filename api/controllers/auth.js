import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res)=>{

    //cek exists user
    const q = "SELECT * FROM users WHERE email = ? OR username = ?"

    db.query(q, [req.body.email, req.body.username], (err,data)=>{
        if(err) return res.json(err)
        if(data.length) return res.status(409).json("Pengguna sudah ada");


        //has pass sama buat user
         const salt = bcrypt.genSaltSync(10);
         const hash = bcrypt.hashSync(req.body.password, salt);    

        const q = "INSERT INTO users(`username`, `email`, `password`) VALUES (?)"
        const values = [
            req.body.username,
            req.body.email,
            hash,
        ]

        db.query(q,[values], (err,data)=>{
            if(err) return res.json(err);
            return res.status(200).json("user created");
        })
    });
};
export const login = (req, res)=>{
//cek user 
const q ="SELECT * FROM users WHERE username = ?"

db.query(q,[req.body.username], (err,data)=>{
    if (err) return res.json(err);
    if(data.length===0){
        return res.status(404).json("user not found")
    }
    const isPasswordCorrect = bcrypt.compareSync(req.body.password,data[0].password)

    if(!isPasswordCorrect){
        return res.status(400).json("password is incorrect")
    }

const token = jwt.sign({id: data[0].id},"jwtkey");
const {password,...Other } = data[0]
res.cookie("access_token",token,{
    httpOnly:true
}).status(200).json(Other)

});

};
export const logout = (req, res)=>{
 res.clearCookie("access_token",{
    sameSite:"none",
    secure:true
 }).status(200).json("user has been logged out")
};