const express = require('express');
const router = express.Router();
const controller = require('../Controllers/leaderBoardController');

router.get('/top5', controller.getTop5RankedUsers);
router.get('/all', controller.getAllRankedUsers);
router.post('/addScore', controller.addScoreToUser);

module.exports = router;


