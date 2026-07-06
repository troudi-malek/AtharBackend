const express = require('express');
const router = express.Router();
const userController=require('../Controllers/userController');
const upload = require('../config/multer');

router.post('/SignUp',userController.register);
router.post('/login',userController.login);
router.post('/deleteProfile',userController.deleteProfile);
router.post('/updateProfile', upload.single('profileImageUrl'), userController.updateProfile);
router.get('/GetUserById/:id', userController.getUserById);
router.get('/getAllUsers', userController.getAllUsers);
module.exports=router