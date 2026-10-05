// server.js
require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/database');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // Sincroniza as tabelas com o banco de dados
    await prisma.$connect();
    console.log('Banco de dados conectado.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  }
}

bootstrap();