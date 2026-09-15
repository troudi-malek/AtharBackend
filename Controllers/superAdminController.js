const express = require('express');
const SuperAdmin = require('../Models/superAdmin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/user');
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
        const superAdmin=await User.findOne({email})
        if (!superAdmin) {
            console.log(email)
            return res.status(401).json({ error: 'Authentication failed' });
        }
        if (superAdmin.kind !== 'SuperAdmin') {
            return res.status(401).json({ error: 'Access denied' });
        }
        const passwordMatch = await bcrypt.compare(password, superAdmin.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const token = jwt.sign(
            { id: superAdmin._id, username: superAdmin.username, kind: superAdmin.kind },
            process.env.ACCESS_TOKEN_SECRET
        );
        res.cookie('token', token, {
            secure: true,
            httpOnly: true,
            sameSite: 'none',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: superAdmin._id,
                username: superAdmin.username,
                kind: superAdmin.kind,
                museumId: null
            }
        });
    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
}

async function me(req, res) {
    res.status(200).json({
        id: req.user.id,
        username: req.user.username,
        kind: req.user.kind,
        museumId: null
    });
}
async function GetAllUser(req,res) {
   try{
    const userList= await User.find();
    res.status(200).json(userList);
   }catch(error) {
    res.status(500).json({ error: 'Failed to get Users Liset' });
   }
}

module.exports={
    register,
    login,
    GetAllUser,
    me
}