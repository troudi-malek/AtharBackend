const express = require('express');
const router = express.Router();
const museumController = require('../Controllers/museumController');
const upload = require('../config/multer');
const verifyToken = require('../middleware/SuperAdminMiddleware');

router.post('/addMuseum', upload.single('imageUrl'), verifyToken,museumController.addMuseum);
router.get('/getMuseums', verifyToken,museumController.getAllMuseums);
router.put('/updateMuseum/:id', verifyToken,upload.single('imageUrl'), museumController.updateMuseum);
router.delete('/deleteMuseum/:id', verifyToken,museumController.deleteMuseum);
router.get('/GetMuseumById/:id',verifyToken,museumController.GetMuseumByID);
router.get('/GetMuseumListForUser/:id',museumController.GetMuseumListForUser);

module.exports = router;
