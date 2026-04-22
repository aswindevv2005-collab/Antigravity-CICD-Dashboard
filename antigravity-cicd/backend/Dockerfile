FROM node:20-alpine

# Install git for the CI engine to clone repos
RUN apk add --no-cache git

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5001

CMD ["node", "server.js"]
