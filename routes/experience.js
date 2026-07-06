const express = require('express');
const router = express.Router();
const experienceController = require('../Controllers/experienceController'); 
const { verifyToken, authorizeRoles } = require('../middleware/Middleware');
const upload = require('../config/multer');

router.post('/addExperience', verifyToken, authorizeRoles('Admin'), upload.single('ArtifactImage'), experienceController.addExperience);
router.post('/getAllExperiences',experienceController.getAllExperiences);
router.post('/getUserExperienceVisit', experienceController.getUserExperienceVisit);
router.put('/updateExperience/:id', verifyToken, authorizeRoles('Admin'), upload.single('ArtifactImage'), experienceController.updateExperience);
router.delete('/deleteExperience/:id', verifyToken, authorizeRoles('Admin'),experienceController.deleteExperience);
router.get('/getExperienceById/:id',experienceController.getExperienceById);

module.exports = router;