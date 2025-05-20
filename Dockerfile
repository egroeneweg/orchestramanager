FROM node:24

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV NODE_ENV=prod

RUN npm run build
EXPOSE 3000

ENTRYPOINT ["npm", "start"]