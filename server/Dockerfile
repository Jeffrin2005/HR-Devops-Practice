# Use Node.js 20 since you are using the --env-file flag
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose port 5000 
EXPOSE 5000

# The command to start the app
CMD ["node", "--env-file=.env", "index.js"]
