# Stage 1: Build the React application
# Use a Node.js base image
FROM node:22-alpine as builder

# Set the working directory in the container
WORKDIR /app

# Define a build-time argument for the API base URL
ARG VITE_API_BASE_URL

# Set the environment variable for the build process
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production
# This assumes your build script is named "build" and output is in "dist"
RUN npm run build

# Stage 2: Serve the application using Nginx
# Use a lightweight Nginx image
FROM nginx:stable-alpine

# Copy the built static files from the builder stage to the Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]