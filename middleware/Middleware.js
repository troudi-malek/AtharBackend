const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    const bearerHeader = req.header('Authorization');

    if (!bearerHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = bearerHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;      // Add full payload (e.g., id, email, kind)
        req.kind = decoded.kind; // You were already doing this
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Invalid token.' });
    }
}


function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        const userRole = req.kind;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
}

module.exports = {
    verifyToken,
    authorizeRoles
};
