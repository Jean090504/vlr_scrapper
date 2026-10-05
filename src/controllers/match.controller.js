// src/controllers/match.controller.js
const syncService = require('../services/sync.service');
const prisma = require('../database');

class MatchController {
  async getLive(req, res, next) {
    try {
      const liveMatches = await syncService.syncMatches('live_score');
      return res.json({ success: true, count: liveMatches.length, data: liveMatches });
    } catch (err) {
      next(err);
    }
  }

  async getResults(req, res, next) {
    try {
      const results = await syncService.syncMatches('results');
      return res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const match = await prisma.match.findUnique({
        where: { id },
        include: {
          team1: true,
          team2: true,
          maps: true,
          playerStats: { include: { player: true } },
        },
      });
      if (!match) return res.status(404).json({ success: false, message: 'Partida não encontrada.' });
      return res.json({ success: true, data: match });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MatchController();