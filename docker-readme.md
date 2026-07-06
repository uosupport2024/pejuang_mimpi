# Running the Frontend with Docker

This document provides instructions on how to set up and run the `pejuang_mimpi` frontend application using Docker and Docker Compose.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
-   Docker to install dokcer refer to this documentation [[https://docs.docker.com/get-started/get-docker/]]
-   Docker Compose to understand compose refer to this documentation [[https://docs.docker.com/compose/intro/compose-application-model/]]
-   A running instance of the backend API. refer to the other repo attendance_pot

## Overview

The Docker environment for the frontend is defined by two main files:
-   `Dockerfile`: A multi-stage Dockerfile that first builds the React application using Node.js and then serves the static output using a lightweight Nginx server.
-   `docker-compose.yml`: Defines the `frontend` service, which builds the `Dockerfile` and exposes the application on port 8080.

## Setup Instructions

### 1. Environment Configuration

The frontend needs to know the URL of the backend API to make requests. This is configured via a build argument in `docker-compose.yml`.

1.  Navigate to the `pejuang_mimpi` directory.
2.  Create a `.env` file.
    ```bash
    touch .env
    ```
3.  Add the `VITE_API_BASE_URL` variable to the `.env` file, pointing to your running backend's API address.
    ```ini
    # Example if the backend is running on http://localhost:8000
    VITE_API_BASE_URL=http://localhost:8000/api
    ```

### 2. Build and Run Container

From the `pejuang_mimpi` directory, run the following command to build the image and start the service:

```bash
docker-compose up -d --build
```

## Accessing the Application

-   **Frontend**: Open your browser and navigate to `http://localhost:8080`.

## Important Notes

-   This frontend application is designed to communicate with the `attendance-pot` backend. Ensure the backend is running and accessible at the URL you provided in the `.env` file.
-   Any changes to the `.env` file will require you to rebuild the Docker image for them to take effect:
    ```bash
    docker-compose up -d --build
    ```
## Afterword

after runing the containers you sould be able to access the application. 

#### Why do i like containers? 
Same like container in shipping industries when you send somehting inside the "container" it is what it is, no hassle of rebuild the whole thing again that may or may not rebuild the entire thing 

in tech saying **build it ship it and finaly run it** when you do have to, no need to installing depedency and configure in new environment. faster deployment means more free time to explore other things **your time is precious**.