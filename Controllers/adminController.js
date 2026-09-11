const express = require('express');
const Admin = require('../Models/admin');
const Museum = require('../Models/museum')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/user');
const { sendMail } = require('../config/mailer');
require('dotenv').config();
async function register(req, res) {
    try {
        const { username, email, password, mangedMuseum } = req.body;
        const museum = await Museum.findById(mangedMuseum);
        console.log(username)
        console.log(mangedMuseum);
        if (!museum) {
            return res.status(401).json({ error: 'The Museum does not exist' });
        }
        const museumName = museum.name;
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ username, email, password: hashedPassword, mangedMuseum, museumName, passwordUpdatedAt: new Date() });
        await admin.save();

        try {
            await sendMail({
                to: email,
                subject: 'Your admin account has been created',
                text: `Hello ${username},\n\nYour admin account was created successfully.\n\nLogin details:\n- Email: ${email}\n- Password: ${password}\n\nFor security, please change your password after first login.\n\nMuseum: ${museumName}\n\nRegards,\nAthar Team`,
                html: `<p>Hello <strong>${username}</strong>,</p>
                       <p>Your admin account was created successfully.</p>
                       <p><strong>Login details:</strong><br/>
                       Email: <code>${email}</code><br/>
                       Password: <code>${password}</code></p>
                       <p>For security, please change your password after first login.</p>
                       <p>Museum: <strong>${museumName}</strong></p>
                       <p>Regards,<br/>Athar Team</p>`
            });
        } catch (mailError) {
            console.log('Failed to send welcome email:', mailError);
            // Continue without failing the registration
        }

        res.status(201).json({ message: 'Admin registered successfully', data: admin });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Registration failed' });
    }
}
async function GetAlluser(req, res) {
    try {
        const UserList = await User.find();
        res.status(201).json({ message: 'Successfully', data: UserList });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Could not Get all users' });
    }

}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email });
        let token;
        console.log(admin)
        if (!admin) {
            console.log(email)
            return res.status(401).json({ error: 'Authentication failed' });
        }
        if (admin.kind != "SuperAdmin" && admin.kind != "Admin") {
            console.log("user type: " + admin.kind)
            return res.status(401).json({ error: 'Access denied' });
        }
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            console.log(password)
            return res.status(401).json({ error: 'Authentication failed' });
        }
        if (admin.kind == "Admin") {
            token = jwt.sign({ id: admin._id, username: admin.username, kind: admin.kind, mangedMuseum: admin.mangedMuseum }, process.env.ACCESS_TOKEN_SECRET);
        } else {
            token = jwt.sign({ id: admin._id, username: admin.username, kind: admin.kind }, process.env.ACCESS_TOKEN_SECRET);
        }

        res.cookie('token', token, {
            secure: true,
            httpOnly: false,
            sameSite: 'none',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({ message: 'Login successful', data: token });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
}

async function getAdminProfile(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let role = 'Museum Administrator';
        let assignedMuseums = [];
        let base = user;

        if (user.kind === 'Admin') {
            const adminDoc = await Admin.findById(id).populate('mangedMuseum');
            if (!adminDoc) {
                return res.status(404).json({ error: 'Admin not found' });
            }
            base = adminDoc;
            assignedMuseums = adminDoc.mangedMuseum ? [adminDoc.mangedMuseum.name] : [];
            role = 'Museum Administrator';
        } else if (user.kind === 'SuperAdmin') {
            role = 'Super Administrator';
            const museums = await Museum.find({}, 'name');
            assignedMuseums = museums.map(m => m.name);
        } else {
            return res.status(400).json({ error: 'Unsupported role' });
        }

        const profile = {
            role,
            assignedMuseums,
            email: base.email,
            memberSince: base.createdAt,
            fullName: base.username,
            phoneNumber: base.phoneNumber || null,
            passwordLastUpdated: base.passwordUpdatedAt || base.updatedAt || base.createdAt
        };
        res.status(200).json({ data: profile });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to fetch admin profile' });
    }
}

async function updateAdminPassword(req, res) {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        const match = await bcrypt.compare(currentPassword, admin.password);
        if (!match) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        admin.password = hashed;
        admin.passwordUpdatedAt = new Date();
        await admin.save();
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to update password' });
    }
}


module.exports = {
    register,
    GetAlluser,
    login,
    getAdminProfile,
    updateAdminPassword
}