const express = require('express');
const router = express.Router();
const experienceController = require('../Controllers/experienceController'); 
const { verifyToken, authorizeRoles } = require('../middleware/Middleware');

router.post('/addExperience', verifyToken, authorizeRoles('Admin'),experienceController.addExperience);
router.post('/getAllExperiences', verifyToken, authorizeRoles('Admin'),experienceController.getAllExperiences);
router.put('/updateExperience/:id', verifyToken, authorizeRoles('Admin'), experienceController.updateExperience);
router.delete('/deleteExperience/:id', verifyToken, authorizeRoles('Admin'),experienceController.deleteExperience);
router.get('/getExperienceById/:id', verifyToken, authorizeRoles('Admin'),experienceController.getExperienceById);

module.exports = router;