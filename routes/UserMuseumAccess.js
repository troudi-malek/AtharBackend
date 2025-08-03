const express = require('express');
const router = express.Router();
const UserMuseumAccessController = require('../Controllers/UserMuseumAccessController');

router.post('/GetAccessedMuseumList',UserMuseumAccessController.GetAccessedMuseumList)
module.exports = router;
