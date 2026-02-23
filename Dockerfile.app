# Dockerfile.app

FROM node:24-alpine

ARG MONGODB_URL
ARG PORT

ENV MONGODB_URL=${MONGODB_URL}
ENV NODE_ENV=production

EXPOSE ${PORT}

RUN apk update && \
    apk upgrade && \
    apk add \
        libc6-compat \
        bash \
        git

WORKDIR /app
COPY package.json package-lock.json ./
COPY . .

RUN npm ci --only=production && npm run build

CMD ["npm", "start"]
