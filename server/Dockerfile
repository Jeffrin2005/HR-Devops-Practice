# Use Node.js 22 to support the latest npm and security patches
FROM node:22-alpine

# Patch Linux vulnerabilities caught by Trivy
RUN apk upgrade --no-cache
RUN npm install -g npm@latest

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN rm -f package-lock.json && npm config set registry https://registry.npmjs.org/ && npm install

# Copy the rest of your backend code
COPY . .

# Expose port 5000 
EXPOSE 5000

# The command to start the app
CMD ["node", "--env-file=.env", "index.js"]
