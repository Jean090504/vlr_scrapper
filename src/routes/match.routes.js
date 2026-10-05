// src/routes/match.routes.js
const { Router } = require('express');
const matchController = require('../controllers/match.controller');

const router = Router();
router.get('/live', matchController.getLive);
router.get('/results', matchController.getResults);
router.get('/:id', matchController.getDetails);

module.exports = router;