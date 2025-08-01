# Stage 1: Build the Angular application
# Use a Node.js image compatible with your version (v22)
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package.json package-lock.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Angular application for production
# This command is the standard build command
RUN npm run build

# Stage 2: Serve the application using a lightweight Nginx server
# Start from a very small Nginx image
FROM nginx:alpine AS serve

# Copy the built files from the previous stage to the Nginx public directory
COPY --from=build /app/dist/football-booking/browser /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Command to start Nginx server
CMD ["nginx", "-g", "daemon off;"]
