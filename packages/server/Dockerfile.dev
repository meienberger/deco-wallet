FROM node:latest

WORKDIR /usr/src/app

COPY yarn.lock ./
COPY package.json ./

RUN yarn

COPY . .

CMD [ "yarn", "dev" ]
