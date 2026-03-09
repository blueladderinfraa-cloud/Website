# Website Deployment Guide for Blueladder Infra

## Overview
Your website is ready to be hosted! This guide will help you deploy your Blueladder Infra website to the internet.

## What You Have
- A full-stack website with:
  - Frontend: React application (client folder)
  - Backend: Express server with database (server folder)
  - Admin panel for managing content
  - Image uploads and storage

## Recommended Hosting Options

### Option 1: Vercel (Easiest - Recommended for Beginners)
**Best for:** Quick deployment, automatic updates
**Cost:** Free tier available, paid plans start at $20/month
**Good for:** Small to medium websites

### Option 2: Railway.app (Good Balance)
**Best for:** Full-stack apps with database
**Cost:** $5/month minimum
**Good for:** Apps that need database and file storage

### Option 3: DigitalOcean / AWS / Google Cloud (Most Control)
**Best for:** Complete control over server
**Cost:** Starting from $6/month
**Good for:** Larger projects, custom requirements

---

## STEP-BY-STEP: Deploy to Railway.app (Recommended)

Railway is perfect for your website because it handles:
- Frontend and backend together
- Database automatically
- File uploads
- Easy domain connection

### Step 1: Prepare Your Project

1. Make sure all your changes are saved
2. Your project needs to be on GitHub (we'll set this up)

### Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository" (green button)
3. Name it: `blueladder-infra-website`
4. Keep it Private
5. Click "Create repository"

### Step 3: Push Your Code to GitHub

Open your terminal and run these commands one by one:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - ready for deployment"

# Connect to your GitHub repository (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/blueladder-infra-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub
4. Click "Deploy from GitHub repo"
5. Select your `blueladder-infra-website` repository
6. Railway will automatically detect your project

### Step 5: Configure Environment Variables

In Railway dashboard:
1. Click on your project
2. Go to "Variables" tab
3. Add these variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<Railway will provide this automatically>
```

If you have other variables in your `.env` file, add them here too.

### Step 6: Connect Your Domain

1. In Railway, go to your project settings
2. Click "Domains"
3. Click "Custom Domain"
4. Enter your domain name (e.g., `blueladderinfra.com`)
5. Railway will show you DNS records to add

### Step 7: Update DNS Settings

Go to your domain provider (where you bought the domain):
1. Find DNS settings
2. Add the records Railway provided:
   - Type: CNAME
   - Name: www (or @)
   - Value: (the value Railway gave you)
3. Save changes

**Note:** DNS changes can take 1-48 hours to work

---

## STEP-BY-STEP: Deploy to Vercel (Alternative)

Vercel is simpler but requires some adjustments for your backend.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
vercel
```

Follow the prompts:
- Link to existing project? No
- Project name: blueladder-infra
- Directory: ./
- Override settings? No

### Step 4: Connect Domain

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your domain
5. Update DNS at your domain provider with Vercel's records

---

## Important: File Uploads Configuration

Your website has image uploads. You need to configure storage:

### Option A: Use Railway's Persistent Storage
1. In Railway, add a "Volume" to your project
2. Mount it to `/app/client/public/uploads`

### Option B: Use Cloud Storage (Recommended for Production)
Use AWS S3, Cloudflare R2, or similar:
1. Create a storage bucket
2. Update your upload code to use cloud storage
3. This prevents losing images when server restarts

---

## Database Setup

Your app uses SQLite. For production:

### Railway (Automatic)
Railway will handle the database automatically.

### Manual Setup
If deploying elsewhere, you may need to:
1. Run migrations: `npm run db:push`
2. Ensure database file is in persistent storage

---

## After Deployment Checklist

✅ Website loads at your domain
✅ Admin panel works (yourdomain.com/admin/content)
✅ Can login to admin
✅ Images upload successfully
✅ Contact form works
✅ All pages load correctly

---

## Testing Your Deployment

1. Visit your domain
2. Check all pages: Home, About, Projects, Services, Contact
3. Test the Cost Estimator
4. Login to admin panel
5. Try uploading an image
6. Submit a contact form

---

## Troubleshooting

### Website not loading
- Check DNS settings (can take up to 48 hours)
- Verify deployment succeeded in Railway/Vercel dashboard
- Check logs for errors

### Images not uploading
- Check storage configuration
- Verify upload folder has write permissions
- Check file size limits

### Admin panel not working
- Verify environment variables are set
- Check database connection
- Clear browser cache

---

## Need Help?

Common issues and solutions:

**"Cannot connect to database"**
- Check DATABASE_URL environment variable
- Ensure database service is running

**"404 Not Found"**
- Check build completed successfully
- Verify routing configuration

**"Images disappear after restart"**
- You need persistent storage or cloud storage
- See "File Uploads Configuration" section above

---

## Monthly Costs Estimate

- **Railway**: $5-20/month (depending on usage)
- **Vercel**: Free to $20/month
- **Domain**: $10-15/year (already purchased)
- **Cloud Storage** (optional): $1-5/month

---

## Next Steps

1. Choose your hosting platform (Railway recommended)
2. Create GitHub repository
3. Push your code
4. Deploy to hosting platform
5. Connect your domain
6. Test everything
7. Go live! 🚀

---

## Quick Command Reference

```bash
# Build for production
npm run build

# Start production server (locally)
npm run start

# Check for errors
npm run check

# Run tests
npm run test
```

---

**Questions?** Let me know which hosting option you want to use, and I can provide more specific guidance!
