FROM node:18-alpine3.17

WORKDIR /frontend/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g @angular/cli@16.2.0

COPY . .

RUN npm run build

EXPOSE 4200