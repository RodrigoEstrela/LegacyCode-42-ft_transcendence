# Use a base Node.js image
FROM node:19

# Install vim
RUN apt-get update && apt-get install vim -y

# Set the working directory inside the container
WORKDIR /app/nestjs

# Copy the package.json and package-lock.json files
COPY ./package*.json ./

# Install dependencies
RUN npm install -g npm@9.8.0
RUN npm install -g @nestjs/cli
RUN npm install --save @nestjs/typeorm typeorm
RUN npm install pg --save
RUN npm install

# Copy the application files
COPY . .

# Install pm2 globablly and upgrade uuid
RUN npm install -g pm2
RUN npm install uuid@7

# Expose the port on which the NestJS application will run
EXPOSE 3000

# Start the NestJS application
CMD ["pm2-runtime", "start", "npm", "--", "run", "start:dev"]

