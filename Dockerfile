# Use the official Node.js v20 image as the base image
FROM node:20-alpine

# Create a new directory for the app
WORKDIR /app

# Update the package manager
RUN apk update

# Copy package json and install package
COPY package-lock.json package.json /app/
RUN npm install pm2 -g && npm install

# Copy the remaining file
COPY . .

ENV TZ=Asia/jakarta
# Build
RUN npm run build \
  && npm prune --productiaon --silent

CMD npm run typeorm:migration:run && pm2-runtime
