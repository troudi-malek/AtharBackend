const express = require('express');
const SuperAdmin = require('../Models/superAdmin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
async function register(req,res){
    try{
        const {username,email,password}=req.body
        const hashedPassword = await bcrypt.hash(password,10);
        const superAdmin = new SuperAdmin({username,email,password:hashedPassword});
        await superAdmin.save();
        res.status(201).json({ message: 'Admin registered successfully',data:superAdmin});
    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Registration failed' });
    }
}

async function login(req,res){
    try{
        const {email,password}=req.body;
        const superAdmin=await SuperAdmin.findOne({email})
        if (!superAdmin) {
            console.log(email)
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const token = jwt.sign({ username: superAdmin.username, email:superAdmin.email }, process.env.ACCESS_TOKEN_SECRET);
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
    login
}