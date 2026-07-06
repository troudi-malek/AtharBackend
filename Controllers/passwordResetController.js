const User = require('../Models/user');
const bcrypt = require('bcrypt');
const { sendMail } = require('../config/mailer');

function generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function requestResetCode(req, res) {
    try {
        const { email } = req.body;
        console.log(email)
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Respond success to avoid user enumeration
            return res.status(200).json({ message: 'If the email exists, a code was sent' });
        }

        const code = generateSixDigitCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.resetCode = code;
        user.resetCodeExpiresAt = expiresAt;
        await user.save();

        try {
            await sendMail({
                to: email,
                subject: 'Your password reset code',
                text: `Your password reset code is ${code}. It expires in 10 minutes.`,
                html: `<p>Your password reset code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`
            });
        } catch (mailError) {
            console.log('Failed to send reset email:', mailError);
            // Still return success to avoid leaking information
        }

        res.status(200).json({ message: 'If the email exists, a code was sent' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to request reset code' });
    }
}

async function verifyResetCode(req, res) {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.resetCode || !user.resetCodeExpiresAt) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        const isExpired = new Date(user.resetCodeExpiresAt).getTime() < Date.now();
        if (isExpired || user.resetCode !== code) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        res.status(200).json({ message: 'Code verified' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to verify code' });
    }
}

async function resetPassword(req, res) {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ error: 'Email and newPassword are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.passwordUpdatedAt = new Date();
        user.resetCode = undefined;
        user.resetCodeExpiresAt = undefined;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to reset password' });
    }
}

// Admin password reset functions
async function adminRequestResetCode(req, res) {
    try {
        const { email } = req.body;
        console.log('Admin reset request for:', email);
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const admin = await User.findOne({ email, role: 'admin' });
        if (!admin) {
            // Respond success to avoid user enumeration
            return res.status(200).json({ message: 'If the email exists, a code was sent' });
        }

        const code = generateSixDigitCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        admin.resetCode = code;
        admin.resetCodeExpiresAt = expiresAt;
        await admin.save();

        try {
            await sendMail({
                to: email,
                subject: 'Your admin password reset code',
                text: `Your admin password reset code is ${code}. It expires in 10 minutes.`,
                html: `<p>Your admin password reset code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`
            });
        } catch (mailError) {
            console.log('Failed to send admin reset email:', mailError);
            // Still return success to avoid leaking information
        }

        res.status(200).json({ message: 'If the email exists, a code was sent' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to request admin reset code' });
    }
}

async function adminVerifyResetCode(req, res) {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        const admin = await User.findOne({ email, role: 'admin' });
        if (!admin || !admin.resetCode || !admin.resetCodeExpiresAt) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        const isExpired = new Date(admin.resetCodeExpiresAt).getTime() < Date.now();
        if (isExpired || admin.resetCode !== code) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        res.status(200).json({ message: 'Admin code verified' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to verify admin code' });
    }
}

async function adminResetPassword(req, res) {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ error: 'Email and newPassword are required' });
        }

        const admin = await User.findOne({ email, role: 'admin' });
        if (!admin) {
            return res.status(400).json({ error: 'Admin not found' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        admin.password = hashed;
        admin.passwordUpdatedAt = new Date();
        admin.resetCode = undefined;
        admin.resetCodeExpiresAt = undefined;
        await admin.save();

        res.status(200).json({ message: 'Admin password updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to reset admin password' });
    }
}

module.exports = {
    requestResetCode,
    verifyResetCode,
    resetPassword,
    adminRequestResetCode,
    adminVerifyResetCode,
    adminResetPassword
}


