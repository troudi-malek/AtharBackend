const express = require('express');
const Admin = require('../Models/admin');
const Museum = require('../Models/museum')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/user');
require('dotenv').config();
async function register(req,res){
    try{
        const {username,email,password,mangedMuseum}=req.body;
        const museum = await Museum.findById(mangedMuseum);
        if(!museum){
            return res.status(401).json({ error: 'The Museum does not exist' });
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const admin = new Admin({username,email,password:hashedPassword,mangedMuseum});
        await admin.save();
        res.status(201).json({ message: 'Admin registered successfully',data:admin});
    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Registration failed' });
    }
}
async function GetAlluser(req,res) {
    try{
        const UserList = await User.find();
        res.status(201).json({ message: 'Successfully',data:UserList});

    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Could not Get all users' });
    }
    
}

async function login(req,res){
    try{
        const {email,password}=req.body;
        const admin=await User.findOne({email});
        let token;
        console.log(admin)
        if (!admin ) {
            console.log(email)
            return res.status(401).json({ error: 'Authentication failed' });
        }
        if(admin.kind != "SuperAdmin" && admin.kind != "Admin"){
            return res.status(401).json({ error: 'Access denied' });
        }    
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        if(admin.kind == "Admin"){
            token = jwt.sign({ username: admin.username,kind:admin.kind, mangedMuseum:admin.mangedMuseum }, process.env.ACCESS_TOKEN_SECRET);
        }else {token = jwt.sign({ username: admin.username,kind:admin.kind}, process.env.ACCESS_TOKEN_SECRET);}
        
        res.cookie('token', token, {
            secure: true,
            sameSite: 'Strict',
            path:'/',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000) ,
        });
        res.status(200).json({ message: 'Login successful',data:token });
    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
}


module.exports={
    register,
    GetAlluser,
    login
}