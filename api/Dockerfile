FROM node:20

WORKDIR /api/src/app

# COPY package*.json ./
COPY *.json ./

RUN npm install

RUN npm run build

EXPOSE 3000