FROM node:24-alpine

# Install packages
RUN apk update && \
    apk upgrade && \
    apk add \
        libc6-compat \
        bash \
        git \
        mongodb-tools

# Set up webserver directory
WORKDIR /app
COPY package.json package-lock.json ./
COPY . .

# Copy local scripts
COPY tools/dbdump.sh /usr/local/bin/dbdump
COPY tools/dbrestore.sh /usr/local/bin/dbrestore

# Configure environment
ENV NODE_ENV=production

RUN npm ci --only=production && npm run build

EXPOSE 3000
EXPOSE 4000

CMD ["npm", "start"]
