# Use the official PostgreSQL image as the base
FROM postgres

# INSTALL vim
RUN apt-get update && apt-get install vim -y

# Set environment variables for the PostgreSQL database
ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=inception123
ENV POSTGRES_DB=pongdb

# Expose the default PostgreSQL port
EXPOSE 5432
