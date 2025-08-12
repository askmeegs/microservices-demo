FROM node:22-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run build

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
