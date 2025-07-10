const express = require('express');
const router = express.Router();
const codeController = require('../Controllers/codeController'); 

router.get('/getCodes', codeController.getAllCodes);
router.post('/updateBalance',codeController.SubmitCode)
router.delete('/deleteCode/:id', codeController.deleteCode);
router.post('/generateCode',codeController.generateCode);
module.exports = router;
