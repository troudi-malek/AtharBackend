const express = require('express');
const User = require('../Models/user');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

async function register(req,res){
    try{
        const {username,email,password,phoneNumber}=req.body
        const hashedPassword = await bcrypt.hash(password,10);
        const user = new User({username,email,password:hashedPassword,phoneNumber});
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
        user.lastlogin = new Date();
        await user.save();
        res.status(200).json({ message: 'Login successful',userID:user._id ,username:user.username,email:user.email});
    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
}

async function updateProfile(req, res) {
    try {
        const { userID, email, username, phoneNumber } = req.body;
        const imageFile = req.file;
        console.log('Received body:', req.body);
        console.log(imageFile);

        if (!userID) {
            return res.status(400).json({ error: 'userID is required' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (email !== undefined) user.email = email;
        if (username !== undefined) user.username = username;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

        if (imageFile) {
            const ext = path.extname(imageFile.filename);
            const newFileName = `${path.basename(imageFile.filename, ext)}-${user._id}${ext}`;
            const uploadsDir = path.join(__dirname, '../public/uploads');
            const oldPath = path.join(uploadsDir, imageFile.filename);
            const newPath = path.join(uploadsDir, newFileName);

            if (user.profileImageUrl) {
                const previousImagePath = path.join(uploadsDir, user.profileImageUrl);
                try {
                    if (fs.existsSync(previousImagePath)) {
                        fs.unlinkSync(previousImagePath);
                    }
                } catch (e) {
                    console.error('Failed to remove previous profile image:', e.message);
                }
            }

            fs.renameSync(oldPath, newPath);
            user.profileImageUrl = newFileName;
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profileImageUrl: user.profileImageUrl
            }
        });
    } catch (error) {
        if (error && error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({ error: 'Email already in use' });
        }
        console.log(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}

async function getUserById(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid user id' });
        }
        const user = await User.findById(id).select('username email phoneNumber');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ data: user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}

async function deleteProfile(req,res){
    try{
        const { email } = req.body;
        if(!email){
            return res.status(400).json({ error: 'Email is required' });
        }

        const deletedUser = await User.findOneAndDelete({ email });
        if(!deletedUser){
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User profile deleted successfully' });
    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Failed to delete profile' });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await User.find().select('username email kind lastlogin');
        const formattedUsers = users.map(user => ({
            username: user.username,
            email: user.email,
            role: user.kind || 'User',
            lastlogin: user.lastlogin
        }));
        res.status(200).json({ 
            message: 'Users retrieved successfully',
            data: formattedUsers 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

module.exports={
    register,
    login,
    deleteProfile,
    updateProfile,
    getUserById,
    getAllUsers
}