FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY schema.prisma ./

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 5000

CMD [ "node", "dist/main.js" ]