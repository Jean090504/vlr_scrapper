FROM node:20-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev
RUN npx prisma generate
RUN npx prisma db push

# Copia código-fonte
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]