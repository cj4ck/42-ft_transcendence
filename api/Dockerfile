FROM node:20

WORKDIR /api/src/app

COPY package*.json ./

RUN npm install
RUN npm install --save @nestjs/typeorm typeorm pg
RUN npm install --save @nestjs/config
RUN npm install --save-dev @types/node

COPY . . 

RUN npm run build

EXPOSE 3000