const express = require('express');
const router = express.Router();
const adminController=require('../Controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/Middleware');

router.post('/SignUp',adminController.register);
router.post('/login',adminController.login);
router.get('/getAlluser',adminController.GetAlluser);
router.get('/profile/:id', verifyToken, authorizeRoles('Admin','SuperAdmin'), adminController.getAdminProfile);
router.put('/password/:id', verifyToken, authorizeRoles('Admin','SuperAdmin'), adminController.updateAdminPassword);
module.exports=router