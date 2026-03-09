# 🚀 Quick Start: Host Your Website in 30 Minutes

## What You Need
1. Your domain name (you already have this! ✅)
2. A GitHub account (free)
3. A Railway account (free to start)

---

## Step 1: Put Your Code on GitHub (5 minutes)

### Create GitHub Account
1. Go to https://github.com/signup
2. Create a free account
3. Verify your email

### Upload Your Code
Open Terminal and run these commands:

```bash
# Step 1: Initialize git
git init

# Step 2: Add all your files
git add .

# Step 3: Save your code
git commit -m "Initial commit"

# Step 4: Create repository on GitHub
# Go to https://github.com/new
# Name: blueladder-infra-website
# Click "Create repository"

# Step 5: Connect and upload (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/blueladder-infra-website.git
git branch -M main
git push -u origin main
```

**Done!** Your code is now on GitHub.

---

## Step 2: Deploy to Railway (10 minutes)

### Create Railway Account
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access GitHub

### Deploy Your Website
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `blueladder-infra-website`
4. Railway will automatically:
   - Detect your app
   - Install dependencies
   - Build your website
   - Start the server

**Wait 2-5 minutes for deployment to complete.**

### Add Environment Variables
1. Click on your project
2. Click "Variables" tab
3. Click "Add Variable"
4. Add these one by one:

```
NODE_ENV = production
PORT = 3000
ADMIN_USERNAME = admin
ADMIN_PASSWORD = YourSecurePassword123!
JWT_SECRET = your-random-secret-key-here
```

**Tip:** For JWT_SECRET, use a random string like: `kj3h4k5j6h7k8j9h0k1j2h3k4j5h6k7j`

---

## Step 3: Connect Your Domain (10 minutes)

### In Railway
1. Click your project
2. Click "Settings"
3. Scroll to "Domains"
4. Click "Add Domain"
5. Enter your domain: `yourdomain.com`
6. Railway will show you DNS records like:

```
Type: CNAME
Name: @
Value: something.railway.app
```

**Copy these records!**

### In Your Domain Provider
(Where you bought your domain - GoDaddy, Namecheap, etc.)

1. Login to your domain provider
2. Find "DNS Settings" or "DNS Management"
3. Click "Add Record" or "Edit DNS"
4. Add the CNAME record from Railway:
   - Type: CNAME
   - Host/Name: @ (or www)
   - Value: (paste from Railway)
   - TTL: Automatic or 3600
5. Save changes

**Important:** DNS changes take 1-48 hours to work. Be patient!

---

## Step 4: Test Your Website (5 minutes)

### While Waiting for DNS
Railway gives you a temporary URL like: `your-project.railway.app`

Test everything:
- [ ] Homepage loads
- [ ] All pages work
- [ ] Admin panel: `your-project.railway.app/admin/content`
- [ ] Can login to admin
- [ ] Can upload images

### After DNS Updates (1-48 hours later)
Visit your actual domain:
- [ ] `yourdomain.com` loads
- [ ] `yourdomain.com/admin/content` works
- [ ] Everything works the same as temporary URL

---

## Step 5: Configure Storage (5 minutes)

Your website needs storage for uploaded images.

### In Railway
1. Click your project
2. Click "New" → "Volume"
3. Name it: `uploads`
4. Mount path: `/app/client/public/uploads`
5. Click "Add"

**Done!** Images will now persist.

---

## 🎉 You're Live!

Your website is now on the internet!

### What You Can Do Now
1. Share your website: `yourdomain.com`
2. Login to admin: `yourdomain.com/admin/content`
3. Add your projects and content
4. Update pricing in Cost Estimator
5. Customize everything!

---

## Costs

### Railway Pricing
- **Hobby Plan**: $5/month
  - Includes: Hosting + Database + Storage
  - Perfect for your website

### Total Monthly Cost
- Railway: $5/month
- Domain: ~$1/month (already paid yearly)
- **Total: ~$6/month**

---

## Updating Your Website

When you make changes:

```bash
# Save your changes
git add .
git commit -m "Updated homepage"
git push

# Railway automatically deploys the update!
```

**That's it!** Railway detects the changes and updates your website automatically.

---

## Need Help?

### Railway Not Deploying?
1. Check "Deployments" tab for errors
2. Click on failed deployment to see logs
3. Common fix: Check environment variables are set

### Domain Not Working?
1. Wait 24-48 hours for DNS
2. Check DNS records are correct
3. Try clearing browser cache

### Images Not Uploading?
1. Make sure Volume is added
2. Check mount path is correct: `/app/client/public/uploads`
3. Restart deployment

### Admin Panel Not Working?
1. Check environment variables (ADMIN_USERNAME, ADMIN_PASSWORD)
2. Clear browser cookies
3. Try incognito/private browsing

---

## Important URLs

- **Your Website**: `yourdomain.com`
- **Admin Panel**: `yourdomain.com/admin/content`
- **Railway Dashboard**: https://railway.app/dashboard
- **GitHub Repository**: `https://github.com/YOUR-USERNAME/blueladder-infra-website`

---

## Admin Panel Access

**URL**: `yourdomain.com/admin/content`

**Default Login**:
- Username: `admin`
- Password: (the one you set in Railway environment variables)

**Change password**: Update `ADMIN_PASSWORD` in Railway variables

---

## Next Steps After Going Live

1. **Add Content**
   - Upload your company logo
   - Add real project photos
   - Update About page with your story
   - Add team member photos

2. **Configure Settings**
   - Update contact information
   - Set pricing in Cost Estimator
   - Add your services

3. **SEO & Marketing**
   - Add to Google Search Console
   - Set up Google Analytics
   - Share on social media
   - Update business listings

4. **Maintenance**
   - Check inquiries daily
   - Backup database weekly
   - Update content regularly
   - Monitor Railway dashboard

---

## Troubleshooting Commands

```bash
# Check if build works locally
npm run build

# Test production mode locally
npm run start

# Check for errors
npm run check

# View git status
git status

# View recent commits
git log --oneline
```

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **GitHub Docs**: https://docs.github.com

---

**Congratulations! Your website is live! 🎊**

You now have a professional website with:
✅ Custom domain
✅ Admin panel for easy updates
✅ Contact form
✅ Project gallery
✅ Cost estimator
✅ Automatic deployments

**Enjoy your new website!**
