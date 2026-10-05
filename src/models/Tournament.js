class Tournament {
  constructor({ id, name, status, prizePool, dates, region, logoUrl, stages = [] }) {
    this.id = id
    this.name = name
    this.status = status // 'upcoming' | 'ongoing' | 'completed'
    this.prizePool = prizePool // Ex: { raw: "$250,000", amount: 250000, currency: "USD" }
    this.dates = dates // Ex: { start: "2026-04-15", end: "2026-05-10" }
    this.region = region
    this.logoUrl = logoUrl
    this.stages = stages; // Grupos, Brackets, Play-ins
  }
}

module.exports = Tournament