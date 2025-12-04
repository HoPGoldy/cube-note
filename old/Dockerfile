FROM node:18.18.2-slim

WORKDIR /app
VOLUME /app

RUN npm install -g --unsafe-perm sqlite3 cube-note

EXPOSE 3700

CMD [ "node", "/usr/local/lib/node_modules/cube-note/dist/cli/index.js", "run" ]
