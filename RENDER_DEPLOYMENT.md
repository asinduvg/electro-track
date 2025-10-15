# Render Deployment Guide

Complete guide to deploy Electro-Track application to Render using a deploy branch workflow.

## Prerequisites

- Render account (sign up at https://render.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 22.19.0+

## Why Render?

Render is an excellent choice for this project because:
- Native PostgreSQL support with automatic provisioning
- Zero-config deployments with Infrastructure as Code
- Free tier available for web services and PostgreSQL
- Automatic SSL certificates
- Built-in health checks and auto-deploy
- WebSocket support included

## Deployment Architecture

Your app will deploy as:
- **Web Service**: Express backend + React frontend (combined)
- **PostgreSQL Database**: Managed PostgreSQL instance
- **Supabase Storage**: For image uploads (separate service)

## Deployment Steps

### 1. Create Deploy Branch

```bash
# Option A: Use existing deploy branch
git checkout deploy
git merge main
git add render.yaml
git commit -m "Add Render configuration"
git push origin deploy

# Option B: Create new deploy branch
git checkout -b render-deploy
git add render.yaml
git commit -m "Add Render configuration"
git push -u origin render-deploy
```

### 2. Deploy via Render Dashboard (Recommended)

#### Method 1: Using render.yaml (Infrastructure as Code)

1. Go to https://dashboard.render.com
2. Click **"New"** → **"Blueprint"**
3. Connect your Git repository
4. Select your deploy branch (e.g., `deploy` or `render-deploy`)
5. Render will detect `render.yaml` and show:
   - Web Service: `electro-track`
   - PostgreSQL Database: `electro-track-db`
6. Click **"Apply"**
7. Render will:
   - Create PostgreSQL database
   - Create web service
   - Link DATABASE_URL automatically
   - Generate SESSION_SECRET
   - Start deployment

#### Method 2: Manual Setup (Alternative)

If you prefer manual setup:

**Step 2a: Create PostgreSQL Database**
1. Dashboard → **"New"** → **"PostgreSQL"**
2. Name: `electro-track-db`
3. Database: `electrotrack`
4. Plan: Free
5. Click **"Create Database"**

**Step 2b: Create Web Service**
1. Dashboard → **"New"** → **"Web Service"**
2. Connect your repository
3. Select your deploy branch
4. Configure:
   - **Name**: `electro-track`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `deploy` (or your deploy branch)
   - **Runtime**: Node
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`
   - **Plan**: Free

**Step 2c: Add Environment Variables**
1. Go to your web service → **Environment** tab
2. Add variables:
   ```
   NODE_ENV=production
   DATABASE_URL=[Click "Generate" and select electro-track-db]
   SESSION_SECRET=[Generate with: openssl rand -base64 32]
   PORT=10000
   ```

3. For Supabase (image storage):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### 3. Run Database Migrations

After first deployment:

**Option A: Via Render Shell**
1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   yarn db:push
   ```

**Option B: Via Local with Render DATABASE_URL**
```bash
# Copy DATABASE_URL from Render dashboard
# Set it locally
export DATABASE_URL="postgresql://..."
yarn db:push
```

### 4. Verify Deployment

1. Check deployment logs in Render dashboard
2. Visit your app URL: `https://electro-track.onrender.com`
3. Test database connectivity
4. Test image uploads (Supabase Storage)

## Deploy Workflow

### Regular Deployments (Automatic)

Render auto-deploys when you push to your deploy branch:

```bash
# Make changes on main branch
git checkout main
# ... make changes ...
git add .
git commit -m "Your changes"
git push origin main

# Merge to deploy branch
git checkout deploy
git merge main
git push origin deploy
# Render automatically deploys!
```

### Manual Deploy

Trigger manual deploy from Render dashboard:
1. Go to your service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Disable Auto-Deploy

If you want manual control:
1. Service → **Settings** → **Build & Deploy**
2. Disable **"Auto-Deploy"**

## Configuration Files

### render.yaml
Infrastructure as Code definition that creates:
- Web service with Node.js runtime
- PostgreSQL database
- Environment variables
- Auto-linking between services

## Environment Variables Reference

### Required Variables (Auto-configured via render.yaml):
- `NODE_ENV=production` - Sets production mode
- `DATABASE_URL` - Auto-linked from PostgreSQL service
- `SESSION_SECRET` - Auto-generated secure random string
- `PORT=10000` - Render's default internal port

### Optional Variables (for Supabase Storage):
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Get these from: Supabase Dashboard → Project Settings → API

## Monitoring and Logs

### View Logs
- Dashboard → Your Service → **"Logs"** tab
- Real-time log streaming
- Filter by time range

### Monitor Performance
- Dashboard → Your Service → **"Metrics"** tab
- CPU usage
- Memory usage
- Response times
- HTTP status codes

### Health Checks
Render automatically health checks your app at `/` (root path).

If you have a custom health endpoint:
1. Service → **Settings** → **Health Check Path**
2. Update to your endpoint (e.g., `/health`)

## Custom Domain (Optional)

### Add Custom Domain
1. Service → **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Add DNS records at your domain provider:
   ```
   Type: CNAME
   Name: app (or @)
   Value: electro-track.onrender.com
   ```
5. Render automatically provisions SSL certificate

## Database Management

### Access Database
1. Dashboard → Your Database → **Info** tab
2. Connection details available:
   - Internal Database URL (for your app)
   - External Database URL (for external tools)

### Connect via psql
```bash
# Copy External Database URL from dashboard
psql "postgresql://user:pass@host/db"
```

### Connect via GUI (TablePlus, DBeaver, etc.)
Use connection details from dashboard Info tab.

### Backup Database
1. Dashboard → Database → **Settings** → **Backups**
2. Free tier: Manual backups only
3. Paid tier: Automatic daily backups

## Troubleshooting

### Build Fails
**Issue**: Build command fails
**Solutions**:
- Check build logs in Render dashboard
- Verify Node.js version: `"engines": { "node": "22.19.0" }` in package.json
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Check that `yarn build` works locally

### Database Connection Issues
**Issue**: Cannot connect to database
**Solutions**:
- Verify DATABASE_URL is set correctly
- Check database service is running (green indicator)
- Review connection logs
- Ensure database migrations ran successfully

### App Crashes on Start
**Issue**: Service keeps restarting
**Solutions**:
- Check logs for error messages
- Verify PORT environment variable is set to 10000
- Ensure `yarn start` works with production build locally
- Check all required environment variables are set

### Slow First Response
**Issue**: First request takes 30+ seconds
**Explanation**: Free tier services spin down after inactivity
**Solutions**:
- Expected behavior on free tier
- Upgrade to paid tier for always-on service
- Use a ping service to keep it alive (not recommended for production)

### WebSocket Connection Issues
**Issue**: WebSockets not working
**Solutions**:
- Render supports WebSockets by default
- Ensure client connects via `wss://` (secure WebSocket)
- Check firewall/proxy settings if behind corporate network

### Image Upload Fails (Supabase)
**Issue**: Images not uploading
**Solutions**:
- Verify `VITE_SUPABASE_URL` is set
- Verify `VITE_SUPABASE_ANON_KEY` is set
- Check Supabase Storage bucket exists and is public
- Review browser console for CORS errors

## Rollback

### Rollback to Previous Deployment
1. Dashboard → Service → **"Events"** tab
2. Find the deployment you want to rollback to
3. Click **"Rollback to this version"**

### Rollback via Git
```bash
git checkout deploy
git reset --hard <previous-commit-hash>
git push --force origin deploy
```

## Scaling

### Vertical Scaling (More Resources)
1. Service → **Settings** → **Instance Type**
2. Upgrade plan for more CPU/RAM

### Horizontal Scaling (More Instances)
Available on paid plans only

## Cost Estimation

### Free Tier Includes:
- **Web Service**: 750 hours/month (enough for 1 service running 24/7)
- **PostgreSQL**: 90 days free, then $7/month for 256MB RAM
- **Bandwidth**: Limited on free tier
- **Build Minutes**: 500 minutes/month free

### Typical Monthly Cost:
- **Development/Small Projects**: $0-7/month (free web + $7 database after 90 days)
- **Production**: $7-25/month (paid web service + database)

**Note**: Free services spin down after 15 minutes of inactivity and take 30+ seconds to wake up.

## Free Tier Limitations

- Services spin down after inactivity (15 min)
- Slower build times
- Limited RAM (512MB)
- No custom instance sizes
- PostgreSQL free for 90 days only

## Best Practices

### 1. Use Deploy Branch
- Keep `main` for development
- Use `deploy` branch for production
- Review changes before merging to deploy

### 2. Environment Variables
- Never commit secrets to git
- Use Render's environment variable management
- Regenerate SESSION_SECRET for production

### 3. Database Migrations
- Always backup before migrations
- Test migrations locally first
- Run migrations before deploying new code

### 4. Monitoring
- Check logs regularly
- Set up external monitoring (UptimeRobot, etc.)
- Monitor database size on free tier

### 5. Security
- Use strong SESSION_SECRET (auto-generated)
- Enable HTTPS (automatic on Render)
- Review CORS settings for production
- Use environment variables for all secrets

## Support Resources

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Render Status: https://status.render.com
- Support: Dashboard → Help icon → Contact Support

## Migration from Other Platforms

### From Heroku
Render has a Heroku import tool:
1. Dashboard → Import from Heroku
2. Connect Heroku account
3. Select apps to migrate

### From Netlify/Vercel
- Export environment variables
- Update build commands in render.yaml
- Push to deploy branch

## Next Steps

After successful deployment:

1. ✅ Test all features in production
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring/alerts
4. ✅ Set up database backups
5. ✅ Document production URLs for team
6. ✅ Set up CI/CD workflow (GitHub Actions, etc.)

## Quick Reference

```bash
# Deploy to Render
git checkout deploy
git merge main
git push origin deploy

# View logs (local)
# View at: https://dashboard.render.com

# Run migrations
# Via Render Shell or local with DATABASE_URL

# Rollback
# Via Render Dashboard → Events → Rollback
```

---

**Need Help?** Check the troubleshooting section or visit Render's excellent documentation at https://render.com/docs
