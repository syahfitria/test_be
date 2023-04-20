FROM node:18

WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN apt update && npm install

EXPOSE 3000

CMD [ "node", "app.js" ]