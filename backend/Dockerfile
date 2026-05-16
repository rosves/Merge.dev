FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN ./node_modules/.bin/prisma generate

EXPOSE 4000

CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]
