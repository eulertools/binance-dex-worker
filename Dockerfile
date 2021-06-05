FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3000
EXPOSE 5000

CMD [ "npm", "start" ]