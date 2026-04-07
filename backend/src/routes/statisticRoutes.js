const express = require('express');
const router = express.Router();
const statisticController = require('../controllers/statisticController');

router.get('/dashboard', statisticController.getDashboardSummary);

module.exports = router;
