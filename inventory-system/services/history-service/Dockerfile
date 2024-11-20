FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY ./src ./src

RUN npx tsc

EXPOSE 4000

CMD ["node", "dist/app.js"]
