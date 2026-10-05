// src/routes/tournament.routes.js
const { Router } = require('express');
const tournamentController = require('../controllers/tournament.controller');

const router = Router();
router.get('/', tournamentController.list);

module.exports = router;