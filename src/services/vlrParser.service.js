// src/services/vlrParser.service.js
const cheerio = require('cheerio');
const httpClient = require('../config/httpClient');
const cache = require('../config/cache');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');

class VlrParserService {
  /**
   * Extrai campeonatos com suporte a cache de 30 minutos
   */
  async fetchTournaments(tier = 'all') {
    const cacheKey = `tournaments_${tier}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const url = tier === 'all' ? '/events' : `/events?tier=${tier}`;
    const { data: html } = await httpClient.get(url);
    const $ = cheerio.load(html);

    const tournaments = [];

    $('a.event-item').each((_, el) => {
      const href = $(el).attr('href') || '';
      const id = href.match(/\/event\/(\d+)/)?.[1];
      const name = $(el).find('.event-item-title').text().trim();
      const status = $(el).find('.event-item-desc-item-status').text().trim().toLowerCase();
      
      const rawPrize = $(el).find('.event-item-desc-item.mod-prize').text().replace(/Prize Pool/i, '').trim();
      const prizeAmount = parseInt(rawPrize.replace(/[^0-9]/g, ''), 10) || 0;

      const dates = $(el).find('.event-item-desc-item.mod-dates').text().replace(/Dates/i, '').trim();

      let logoUrl = $(el).find('.event-item-thumb img').attr('src');
      if (logoUrl && logoUrl.startsWith('//')) logoUrl = `https:${logoUrl}`;

      if (id && name) {
        tournaments.push(
          new Tournament({
            id,
            name,
            status,
            prizePool: { raw: rawPrize || 'N/A', amount: prizeAmount, currency: 'USD' },
            dates,
            region: $(el).find('.flag').attr('class')?.replace(/flag mod-/i, '') || 'intl',
            logoUrl: logoUrl || null,
          })
        );
      }
    });

    // Torneios mudam devagar: 30 minutos de cache
    cache.set(cacheKey, tournaments, 1800);
    return tournaments;
  }

  /**
   * Extrai partidas (ao vivo e resultados) com cache curto
   */
  async fetchMatches(type = 'live_score') {
    const cacheKey = `matches_${type}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const path = type === 'results' ? '/matches/results' : '/matches';
    const { data: html } = await httpClient.get(path);
    const $ = cheerio.load(html);

    const matches = [];

    $('a.wf-module-item').each((_, el) => {
      const href = $(el).attr('href') || '';
      const id = href.split('/')[1];

      const team1Name = $(el).find('.match-item-vs-team-name').first().text().trim();
      const team2Name = $(el).find('.match-item-vs-team-name').last().text().trim();

      const score1 = parseInt($(el).find('.match-item-vs-team-score').first().text().trim(), 10) || 0;
      const score2 = parseInt($(el).find('.match-item-vs-team-score').last().text().trim(), 10) || 0;

      const eventName = $(el).find('.match-item-event').text().replace(/\s+/g, ' ').trim();
      const eta = $(el).find('.match-item-eta').text().replace(/\s+/g, ' ').trim();

      let status = 'upcoming';
      if (eta.toLowerCase().includes('live')) status = 'live';
      if (type === 'results' || eta.toLowerCase().includes('ago')) status = 'completed';

      if (team1Name && team2Name) {
        matches.push(
          new Match({
            id,
            tournament: { name: eventName },
            team1: { name: team1Name, scoreSeries: score1 },
            team2: { name: team2Name, scoreSeries: score2 },
            status,
            format: 'BO3',
          })
        );
      }
    });

    // 30 segundos para partidas ao vivo, 3 minutos para resultados
    const ttl = type === 'live_score' ? 30 : 180;
    cache.set(cacheKey, matches, ttl);
    return matches;
  }

  /**
   * Extrai o detalhamento completo de uma partida: mapas, agentes e performance dos jogadores
   */
  async fetchMatchDetails(matchId) {
    const cacheKey = `match_detail_${matchId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const { data: html } = await httpClient.get(`/${matchId}`);
    const $ = cheerio.load(html);

    const team1Name = $('.match-header-link-name.mod-1').text().trim();
    const team2Name = $('.match-header-link-name.mod-2').text().trim();

    // Mapas e estatísticas dos jogadores
    const maps = [];
    $('.vm-stats-game').each((_, mapEl) => {
      const mapName = $(mapEl).find('.map').text().replace(/\s+/g, ' ').trim();
      if (!mapName || mapName.toLowerCase().includes('all maps')) return;

      const players = [];

      $(mapEl).find('table.wf-table-inset tbody tr').each((_, row) => {
        const playerName = $(row).find('.mod-player .text-of').text().trim();
        const agentName = $(row).find('.mod-agents img').attr('title')?.trim();
        
        // Colunas estatísticas padrão do VLR: Rating, ACS, K, D, A, +/-, KAST, ADR, HS%
        const cols = $(row).find('.mod-stat');
        const acs = $(cols[1]).text().trim();
        const kills = $(cols[2]).text().trim();
        const deaths = $(cols[3]).text().trim();
        const assists = $(cols[4]).text().trim();
        const adr = $(cols[7]).text().trim();
        const hsPercent = $(cols[8]).text().trim();

        if (playerName) {
          players.push({
            name: playerName,
            agent: agentName || 'Unknown',
            stats: {
              acs: parseInt(acs, 10) || 0,
              kills: parseInt(kills, 10) || 0,
              deaths: parseInt(deaths, 10) || 0,
              assists: parseInt(assists, 10) || 0,
              adr: parseFloat(adr) || 0,
              hsPercent: hsPercent || '0%',
            },
          });
        }
      });

      maps.push({ mapName, players });
    });

    const result = {
      matchId,
      teams: [team1Name, team2Name],
      maps,
    };

    cache.set(cacheKey, result, 300); // 5 minutos de cache
    return result;
  }
}

module.exports = new VlrParserService();