docker network create --driver bridge project-network
docker build -t mrspec7er/postgres:latest --target postgres .
docker build -t mrspec7er/fastify:latest --target fastify .
docker run --name project-database -d --network project-network mrspec7er/postgres:latest
docker run --name project-backend -d -p 3000:3000 --network project-network mrspec7er/fastify:latest