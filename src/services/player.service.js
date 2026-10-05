const prisma = require('../database');
const httpClient = require('../config/httpClient');
const cheerio = require('cheerio');
const cache = require('../config/cache');
const { cleanText, normalizeUrl } = require('../utils/stringUtils');

class PlayerService {
  /**
   * Busca jogador no banco; se não existir, raspa direto da página de perfil do VLR (/player/:id)
   */
  async getPlayerById(playerId) {
    const cacheKey = `player_${playerId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Tenta trazer do banco primeiro
    let player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { team: true, stats: true },
    });

    if (player) {
      cache.set(cacheKey, player, 600);
      return player;
    }

    // Se não estiver no banco, busca na web
    const { data: html } = await httpClient.get(`/player/${playerId}`);
    const $ = cheerio.load(html);

    const nickname = cleanText($('.player-header .wf-title').text());
    const realName = cleanText($('.player-header .player-real-name').text());
    let avatarUrl = normalizeUrl($('.player-header img').attr('src'));

    if (!nickname) {
      const err = new Error('Jogador não encontrado no VLR.');
      err.status = 404;
      throw err;
    }

    player = {
      id: playerId,
      nickname,
      realName,
      avatarUrl,
    };

    cache.set(cacheKey, player, 600);
    return player;
  }
}

module.exports = new PlayerService();