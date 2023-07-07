# Use a base Node.js image
FROM node:19

# Set the working directory inside the container
WORKDIR /app


# Copy the package.json and package-lock.json files
COPY my-nestjs-02/package*.json ./

# Install dependencies
RUN npm install -g npm@9.8.0
RUN npm install

# Copy the application files
COPY my-nestjs-02 ./

# Expose the port on which the NestJS application will run
EXPOSE 3000

# Start the NestJS application
CMD ["npm", "run", "start:dev"]

