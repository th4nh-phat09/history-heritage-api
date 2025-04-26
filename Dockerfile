FROM node:20-alpine

WORKDIR /app/backend

COPY package*.json ./

RUN npm install

RUN npm install -g @babel/core @babel/cli

COPY . .

RUN npm run build

CMD [ "npm","run", "production" ]

#docker build --tag node-docker .
# docker run -p 8080:8080 -d node-docker