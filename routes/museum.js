const express = require('express');
const router = express.Router();
const museumController = require('../Controllers/museumController');
const upload = require('../config/multer');

router.post('/addMuseum', upload.single('imageUrl'), museumController.addMuseum);
router.get('/getMuseums', museumController.getAllMuseums);
router.put('/updateMuseum/:id', upload.single('imageUrl'), museumController.updateMuseum);
router.delete('/deleteMuseum/:id', museumController.deleteMuseum);

module.exports = router;
