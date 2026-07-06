const express = require('express');
const router = express.Router();
const codeController = require('../Controllers/codeController'); 
const { verifyToken, authorizeRoles } = require('../middleware/Middleware');

router.get('/getCodes', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), codeController.getAllCodes);
router.post('/SubmitCode',codeController.SubmitCode)
router.delete('/deleteCode/:id', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), codeController.deleteCode);
router.post('/generateCode', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), codeController.generateCode);
router.post('/submitCodeWithoutMuseumId', codeController.submitCodeWithoutMuseumId);
router.post('/getCodesByMuseum', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), codeController.getCodesByMuseum);
module.exports = router;
