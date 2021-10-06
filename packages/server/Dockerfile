FROM node:latest

WORKDIR /usr/src/app

COPY yarn.lock ./

RUN yarn

COPY . .

CMD [ "yarn", "dev" ]
