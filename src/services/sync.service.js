// src/services/sync.service.js
const prisma = require('../database');
const vlrParser = require('./vlrParser.service');

class SyncService {
  async syncTournaments() {
    const rawEvents = await vlrParser.fetchTournaments();

    for (const evt of rawEvents) {
      await prisma.tournament.upsert({
        where: { id: evt.id },
        update: {
          name: evt.name,
          status: evt.status,
          prizePool: evt.prizePool?.raw,
          dates: evt.dates,
          region: evt.region,
          logoUrl: evt.logoUrl,
        },
        create: {
          id: evt.id,
          name: evt.name,
          status: evt.status,
          prizePool: evt.prizePool?.raw,
          dates: evt.dates,
          region: evt.region,
          logoUrl: evt.logoUrl,
        },
      });
    }

    return prisma.tournament.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }

  async syncMatches(type = 'results') {
    const rawMatches = await vlrParser.fetchMatches(type);

    for (const m of rawMatches) {
      // Garante que ambos os times existam no banco
      const team1 = await prisma.team.upsert({
        where: { name: m.team1.name },
        update: {},
        create: { name: m.team1.name },
      });

      const team2 = await prisma.team.upsert({
        where: { name: m.team2.name },
        update: {},
        create: { name: m.team2.name },
      });

      await prisma.match.upsert({
        where: { id: m.id },
        update: {
          score1: m.team1.scoreSeries,
          score2: m.team2.scoreSeries,
          status: m.status,
          roundInfo: m.roundInfo,
        },
        create: {
          id: m.id,
          team1Id: team1.id,
          team2Id: team2.id,
          score1: m.team1.scoreSeries,
          score2: m.team2.scoreSeries,
          status: m.status,
          roundInfo: m.roundInfo,
        },
      });
    }

    return prisma.match.findMany({
      include: { team1: true, team2: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }
}

module.exports = new SyncService();