const express = require('express');
const User = require('../Models/user');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function register(req,res){
    try{
        const {username,email,password}=req.body
        const hashedPassword = await bcrypt.hash(password,10);
        const user = new User({username,email,password:hashedPassword});
        await user.save()
        res.status(201).json({ message: 'User registered successfully',data:user});
    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Registration failed' });
    }
}
async function login(req,res){
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email})
        if (!user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        if(user.kind == "Admin" ||user.kind == "SuperAdmin"){
            return res.status(401).json({ error: 'Access denied' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        res.status(200).json({ message: 'Login successful' });
    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
}

module.exports={
    register,
    login
}