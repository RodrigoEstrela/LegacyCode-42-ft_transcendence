# Use a base Node.js image
FROM node:19

# Install vim
RUN apt-get update && apt-get install vim -y

# Set the working directory inside the container
WORKDIR /app/nestjs

# Copy the package.json and package-lock.json files
COPY ./package*.json ./

# Copy the .env file
COPY ./src/.env ./

# Install dependencies
RUN npm install

# Copy the application files
COPY . .

# Install pm2 globablly and upgrade uuid
RUN npm install -g pm2
RUN npm install uuid@7

# Start the NestJS application
CMD ["pm2-runtime", "start", "npm", "--", "run", "start:dev"]
