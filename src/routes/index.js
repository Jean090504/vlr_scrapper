// src/routes/index.js
const { Router } = require('express');
const tournamentController = require('../controllers/tournament.controller');
const matchController = require('../controllers/match.controller');

const router = Router();

// Torneios
router.get('/tournaments', tournamentController.list);
router.get('/tournaments/:id', tournamentController.getById);

// Partidas
router.get('/matches/live', matchController.getLive);
router.get('/matches/results', matchController.getResults);
router.get('/matches/:id', matchController.getById);

module.exports = router;