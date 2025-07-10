const express = require('express');
const router = express.Router();
const adminController=require('../Controllers/adminController');

router.post('/SignUp',adminController.register);
router.post('/login',adminController.login);
router.get('/getAlluser',adminController.GetAlluser);
module.exports=router