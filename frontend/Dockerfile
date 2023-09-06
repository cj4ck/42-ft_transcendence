# 💡 warning - I degraded the node version from 20 to 18 bc apparently babel was breaking angular's cli
# link that helped me resolve: https://github.com/angular/angular-cli/issues/25782
FROM node:18

WORKDIR /frontend/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g @angular/cli@16.2.0

COPY . .

RUN npm run build

EXPOSE 4200