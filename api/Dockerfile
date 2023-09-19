FROM node:16

WORKDIR /api/src/app

COPY package*.json ./

# 💡warning, I added this myself bc docker compose build wouldn't work
COPY tsconfig.json ./

RUN npm install

RUN npm run build

EXPOSE 3000