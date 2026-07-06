const express = require('express');
const router = express.Router();
const museumController = require('../Controllers/museumController');
const upload = require('../config/multer');
const { verifyToken, authorizeRoles } = require('../middleware/Middleware');

router.post('/addMuseum', upload.single('imageUrl'), verifyToken, authorizeRoles('SuperAdmin'), museumController.addMuseum);
router.put('/updateMuseum/:id', verifyToken, authorizeRoles('Admin','SuperAdmin'), upload.single('imageUrl'), museumController.updateMuseum);
router.delete('/deleteMuseum/:id', verifyToken, authorizeRoles('SuperAdmin'), museumController.deleteMuseum);
router.get('/getMuseums', verifyToken, authorizeRoles('Admin', 'SuperAdmin'),museumController.getAllMuseums);
router.get('/GetMuseumById/:id', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), museumController.GetMuseumByID);
router.get('/GetMuseumListForUser/:id', museumController.GetMuseumListForUser);
router.get('/GetMuseumListForLoggedOffUser',museumController.GetMuseumListForLoggedOffUser)
router.post('/calculateMuseumIncome/:id', verifyToken, authorizeRoles('SuperAdmin'),museumController.calculateMuseumIncome);
router.get('/stats', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), museumController.getPlatformStats);
router.get('/income', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), museumController.getAllMuseumsIncome);

module.exports = router;
