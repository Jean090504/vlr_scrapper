class Match {
  constructor({ id, tournament, team1, team2, format, status, liveScore, maps = [] }) {
    this.id = id
    this.tournament = tournament // { id, name, stage }
    this.team1 = team1 // { id, name, logo, scoreSeries }
    this.team2 = team2 // { id, name, logo, scoreSeries }
    this.format = format // Ex: 'BO3', 'BO5'
    this.status = status // 'upcoming' | 'live' | 'completed'
    this.liveScore = liveScore // Rounds parciais se estiver em andamento
    this.maps = maps // Lista detalhada de mapas e desempenho dos jogadores
  }
}

module.exports = Match