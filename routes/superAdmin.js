const express = require('express');
const router = express.Router();
const superAdminController=require('../Controllers/superAdminController');
const { verifyToken, authorizeRoles } = require('../middleware/Middleware'); 

router.post('/SignUp',superAdminController.register);
router.post('/login',superAdminController.login);
router.get('/getAllusers',verifyToken,authorizeRoles('SuperAdmin'),superAdminController.GetAllUser);
module.exports=router;