const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    const bearerHeader = req.header('Authorization');

    const token = bearerHeader
        ? bearerHeader.startsWith('Bearer ')
            ? bearerHeader.slice(7)
            : null
        : req.cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;  
        req.kind = decoded.kind;
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
