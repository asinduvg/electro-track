# ElectroTrack - Local Development Setup

This guide will help you set up ElectroTrack for local development on your machine.

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **PostgreSQL** database (or use Neon for easy setup)
3. **Git** (for cloning the repository)

## Local Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repository-url>
cd electrotrack

# Install dependencies
npm install
```

### 2. Database Setup

You have two options for the database:

#### Option A: Use Neon Database (Recommended for easy setup)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a free account and new project
3. Copy the connection string from your project dashboard

#### Option B: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:

```sql
CREATE DATABASE electrotrack;
```

3. Your connection string will be: `postgresql://username:password@localhost:5432/electrotrack`

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database details
nano .env  # or use your preferred editor
```

Update the `.env` file with your database connection:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/electrotrack
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
PORT=5000
```

### 4. Database Migration

```bash
# Push the schema to your database
npm run db:push
```

### 5. Start Development Server

```bash
# Start the application
npm run dev
```

The application will be available at: `http://localhost:5000`

## Development Workflow

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files

### Project Structure

```
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types and schema
├── .env             # Environment variables (local only)
├── .env.example     # Environment template
└── package.json     # Dependencies and scripts
```

### Database Management

The project uses Drizzle ORM with PostgreSQL. To make schema changes:

1. Edit `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Never write SQL migrations manually

### Troubleshooting

#### Database Connection Issues

- Verify your DATABASE_URL in `.env`
- Ensure PostgreSQL is running (if using local PostgreSQL)
- Check if the database exists

#### Port Already in Use

- Change the PORT in your `.env` file
- Or kill the process using port 5000: `lsof -ti:5000 | xargs kill`

#### Module Not Found Errors

- Run `npm install` to ensure all dependencies are installed
- Check if Node.js version is 18 or higher

## Differences from Replit

When running locally vs. Replit:

1. **Environment Variables**: Use `.env` file instead of Replit secrets
2. **Database**: Setup your own PostgreSQL or use Neon
3. **Port**: Can use any available port (configurable in `.env`)
4. **File System**: Standard file system instead of Replit's virtual environment

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a production PostgreSQL database
3. Set strong `SESSION_SECRET`
4. Run `npm run build` to create optimized build
5. Serve the built files with a production server

## Support

If you encounter issues with local setup:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure your database connection string is correct
4. Check that all environment variables are set properly
