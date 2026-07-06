var express = require('express');
var router = express.Router();
const passwordResetController = require('../Controllers/passwordResetController');

// Regular user password reset routes
router.post('/request', passwordResetController.requestResetCode);
router.post('/verify', passwordResetController.verifyResetCode);
router.post('/reset', passwordResetController.resetPassword);

// Admin password reset routes
router.post('/admin/request', passwordResetController.adminRequestResetCode);
router.post('/admin/verify', passwordResetController.adminVerifyResetCode);
router.post('/admin/reset', passwordResetController.adminResetPassword);

module.exports = router;


