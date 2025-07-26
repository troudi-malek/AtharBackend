const express = require('express');
const router = express.Router();
const superAdminController=require('../Controllers/superAdminController');
const verifyToken = require('../middleware/SuperAdminMiddleware');

router.post('/SignUp',superAdminController.register);
router.post('/login',superAdminController.login);
router.get('/getAllusers',verifyToken,superAdminController.GetAllUser);
module.exports=router;