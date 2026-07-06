const express = require('express');
const router = express.Router();
const UserMuseumAccessController = require('../Controllers/UserMuseumAccessController');

router.post('/GetAccessedMuseumList',UserMuseumAccessController.GetAccessedMuseumList);
router.post('/GetLatestVisitedExperience',UserMuseumAccessController.GetLatestVisitedExperience)
router.post('/AddVisitedExperience',UserMuseumAccessController.AddVisitedExperience)
module.exports = router;
