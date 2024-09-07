# Use the official Node.js 20 image, based on Alpine Linux
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies, including devDependencies, to ensure react-app-rewired is available
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production using react-app-rewired
RUN npm run build

# Remove devDependencies after build to reduce the image size
RUN npm prune --production

# Install a simple HTTP server to serve the static files
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 5173

# Command to serve the app in production mode
CMD ["serve", "-s", "dist", "-l", "5173"]
