# ElectroTrack - Local Development Setup

This guide will help you set up ElectroTrack for local development on your machine using Docker.

## Prerequisites

1. **Node.js** (version 22.19.0)
2. **Docker** and **Docker Compose** installed
3. **Git** (for cloning the repository)

## Local Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repository-url>
cd electro-track

# Install dependencies
yarn install
```

### 2. Database Setup (Docker PostgreSQL)

Start the PostgreSQL database using Docker:

```bash
# Navigate to docker directory
cd docker

# Start PostgreSQL container
docker-compose up -d

# Verify container is running
docker ps
```

The Docker setup will:
- Start PostgreSQL on port 5433
- Initialize the database with the schema from `sql/init.sql`
- Create a persistent volume for data storage

See `docker/README.md` for detailed Docker setup instructions.

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

The `.env` file is already configured for Docker PostgreSQL:

```env
# Database Configuration (Docker PostgreSQL for local development)
DATABASE_URL=postgresql://myuser:mypassword@localhost:5433/electrotrack

# Session Configuration
SESSION_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development

# Server Configuration
PORT=5000
```

### 4. Database Migration

```bash
# Push the schema to your database
yarn db:push
```

### 5. Start Development Server

```bash
# Start the application
yarn dev
```

The application will be available at: `http://localhost:5000`

## Development Workflow

### Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn db:push` - Push schema changes to database
- `yarn check` - Run TypeScript type checking
- `yarn format` - Format code with Prettier

### Project Structure

```
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types and schema
├── docker/           # Docker PostgreSQL setup
│   ├── docker-compose.yml
│   ├── sql/init.sql
│   └── README.md
├── .env             # Environment variables (local only)
├── .env.example     # Environment template
└── package.json     # Dependencies and scripts
```

### Database Management

The project uses Drizzle ORM with PostgreSQL. To make schema changes:

1. Edit `shared/schema.ts`
2. Run `yarn db:push` to apply changes
3. Never write SQL migrations manually

#### Docker Database Commands

```bash
# Stop database
cd docker && docker-compose down

# Stop and remove all data (fresh start)
cd docker && docker-compose down -v

# View database logs
cd docker && docker-compose logs -f

# Access PostgreSQL CLI
docker exec -it my-postgres psql -U myuser -d electrotrack
```

### Troubleshooting

#### Database Connection Issues

- Verify Docker container is running: `docker ps`
- Check DATABASE_URL in `.env` matches Docker configuration
- View logs: `cd docker && docker-compose logs`

#### Port Already in Use

- **Database port 5433**: Change port in `docker/docker-compose.yml` and update `.env`
- **App port 5000**: Change PORT in your `.env` file
- Or kill the process: `lsof -ti:5000 | xargs kill`

#### Module Not Found Errors

- Run `yarn install` to ensure all dependencies are installed
- Check if Node.js version matches: `node --version` (should be 22.19.0)

#### Docker Issues

- Ensure Docker daemon is running
- Try restarting Docker containers: `cd docker && docker-compose restart`
- Fresh start: `cd docker && docker-compose down -v && docker-compose up -d`

## Production Deployment

For production deployment (e.g., on Render):

1. Use production database (e.g., Neon PostgreSQL)
2. Set `NODE_ENV=production`
3. Set strong `SESSION_SECRET`
4. Run `yarn build` to create optimized build
5. Use `yarn start` to serve the production build

**Note**: The deploy branch uses Neon PostgreSQL for production deployment on Render.

## Differences from Production (Deploy Branch)

When running locally vs. production:

1. **Database**: Docker PostgreSQL (local) vs. Neon PostgreSQL (production)
2. **Environment Variables**: `.env` file (local) vs. Render environment variables (production)
3. **Port**: 5000 (local, configurable) vs. assigned by Render (production)
4. **Dependencies**: Simplified for local development (no Neon serverless drivers)

## Support

If you encounter issues with local setup:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure Docker containers are running
4. Check that all environment variables are set properly
5. Review `docker/README.md` for Docker-specific issues
