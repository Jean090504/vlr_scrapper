// src/controllers/tournament.controller.js
const syncService = require('../services/sync.service');
const prisma = require('../database');

class TournamentController {
  async list(req, res, next) {
    try {
      // Sincroniza e retorna do banco
      const tournaments = await syncService.syncTournaments();
      return res.json({ success: true, count: tournaments.length, data: tournaments });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: { matches: { include: { team1: true, team2: true } } },
      });
      if (!tournament) return res.status(404).json({ success: false, message: 'Torneio não encontrado.' });
      return res.json({ success: true, data: tournament });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TournamentController();