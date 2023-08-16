FROM Node.20 AS development

WORKDIR /api/src/app

COPY package*.json ./

RUN nmp install

COPY . .

RUN npm run build

EXPOSE 3000