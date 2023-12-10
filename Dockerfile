FROM node:16-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i --production audit=false 

COPY . .

USER node
CMD ["npm", "start"]
