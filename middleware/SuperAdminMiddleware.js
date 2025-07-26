const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    const bearerHeader = req.header('Authorization');

    if (!bearerHeader) {
        console.log("Access denied. No token provided")
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    const token = bearerHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token missing.' });
    }

    try {
        console.log("Token: ", token);
        console.log("Secret: ", process.env.ACCESS_TOKEN_SECRET);
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.kind=decoded.kind;
        if(req.kind == 'Admin'){
             return res.status(401).json({ error: 'Access denied.' });
        }
        console.log(req.kind);
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Invalid token.' });
    }
}

module.exports = verifyToken;
