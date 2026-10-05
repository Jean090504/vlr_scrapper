const playerService = require('../services/player.service');

class PlayerController {
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await playerService.getPlayerById(id);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PlayerController();