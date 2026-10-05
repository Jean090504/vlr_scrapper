const { PrismaClient } = require('@prisma/client');

// Singleton para não estourar conexões em reload
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = prisma;