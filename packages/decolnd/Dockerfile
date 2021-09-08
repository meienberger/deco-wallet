FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --only=production

COPY . .

RUN yarn build

CMD [ "yarn", "serve" ]
