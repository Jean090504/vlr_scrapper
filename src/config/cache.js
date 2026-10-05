// Cache em memória leve para respostas rápidas sem overhead de banco
class CacheService {
  constructor() {
    this.cache = new Map()
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return item.data
  }

  set(key, data, ttlSeconds = 60) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  flush() {
    this.cache.clear()
  }
}

module.exports = new CacheService()