FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm run prisma-generate

COPY . .

RUN npm run build

EXPOSE 5000

CMD [ "node", "dist/main.js" ]