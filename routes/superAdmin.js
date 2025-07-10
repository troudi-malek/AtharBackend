const express = require('express');
const router = express.Router();
const superAdminController=require('../Controllers/superAdminController');

router.post('/SignUp',superAdminController.register);
router.post('/login',superAdminController.login);
module.exports=router