# Docker PostgreSQL Setup

This directory contains the Docker setup for running PostgreSQL locally for development.

## Prerequisites

- Docker installed on your system
- Docker Compose installed

## Getting Started

### 1. Start the Database

From the `docker` directory, run:

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL container on port 5433
- Initialize the database with the schema from `sql/init.sql`
- Create a persistent volume for data storage

### 2. Verify the Database is Running

```bash
docker ps
```

You should see a container named `my-postgres` running.

### 3. Connect to the Database

The database is accessible at:
```
postgresql://myuser:mypassword@localhost:5433/electrotrack
```

This connection string is already configured in `.env.example`.

## Useful Commands

### Stop the Database
```bash
docker-compose down
```

### Stop and Remove Data (Fresh Start)
```bash
docker-compose down -v
```

### View Logs
```bash
docker-compose logs -f
```

### Access PostgreSQL CLI
```bash
docker exec -it my-postgres psql -U myuser -d electrotrack
```

## Configuration

- **Database Name**: electrotrack
- **Username**: myuser
- **Password**: mypassword
- **Port**: 5433 (mapped from container's 5432)

You can modify these values in `docker-compose.yml`.

## Initialization Script

The `sql/init.sql` file contains the database schema and is automatically executed when the container is first created. If you need to reset the database with this script, you must:

1. Stop and remove the container and volume:
   ```bash
   docker-compose down -v
   ```

2. Start the container again:
   ```bash
   docker-compose up -d
   ```

## Troubleshooting

### Port Already in Use
If port 5433 is already in use, you can change it in `docker-compose.yml`:
```yaml
ports:
  - '5434:5432'  # Change 5433 to another port
```

Don't forget to update your `DATABASE_URL` in `.env` accordingly.

### Cannot Connect to Database
1. Make sure the container is running: `docker ps`
2. Check the logs for errors: `docker-compose logs`
3. Verify your connection string matches the configuration

### Data Persistence
The database data is stored in a Docker volume named `postgres-data`. This volume persists even when the container is stopped. To completely remove all data, use `docker-compose down -v`.
