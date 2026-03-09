# 🚀 Deployment Checklist for Blueladder Infra Website

## Before Deployment

### 1. Code Preparation
- [ ] All features are working locally
- [ ] No console errors in browser
- [ ] Admin panel works correctly
- [ ] All images load properly
- [ ] Contact form works
- [ ] Cost estimator calculates correctly

### 2. Environment Setup
- [ ] Create `.env.production` file with production values
- [ ] Change default admin password
- [ ] Generate secure JWT secret
- [ ] Remove any test/debug code

### 3. Build Test
- [ ] Run `npm run build` successfully
- [ ] Run `npm run start` and test locally
- [ ] Check that production build works

## GitHub Setup

- [ ] Create GitHub account (if you don't have one)
- [ ] Create new repository: `blueladder-infra-website`
- [ ] Push code to GitHub:
  ```bash
  git init
  git add .
  git commit -m "Ready for deployment"
  git remote add origin https://github.com/YOUR-USERNAME/blueladder-infra-website.git
  git push -u origin main
  ```

## Hosting Platform Setup (Railway)

- [ ] Create Railway account at https://railway.app
- [ ] Connect GitHub account
- [ ] Create new project from GitHub repo
- [ ] Wait for initial deployment

## Configuration

### Environment Variables (in Railway)
- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT=3000`
- [ ] Add admin credentials
- [ ] Add JWT secret
- [ ] Add any other required variables

### Database
- [ ] Database is created automatically by Railway
- [ ] Run migrations if needed: `npm run db:push`

### Storage
- [ ] Add Railway Volume for persistent storage
- [ ] Mount to `/app/client/public/uploads`
- [ ] OR configure cloud storage (S3, Cloudflare R2)

## Domain Connection

- [ ] Get your domain name ready
- [ ] In Railway: Settings → Domains → Add Custom Domain
- [ ] Copy the DNS records Railway provides
- [ ] Go to your domain provider's website
- [ ] Add DNS records:
  - Type: CNAME or A
  - Name: @ or www
  - Value: (from Railway)
- [ ] Wait for DNS propagation (1-48 hours)

## Testing After Deployment

### Basic Tests
- [ ] Website loads at your domain
- [ ] Homepage displays correctly
- [ ] All navigation links work
- [ ] Images load properly

### Page Tests
- [ ] Home page works
- [ ] About page works
- [ ] Services page works
- [ ] Projects page works
- [ ] Project detail pages work
- [ ] Contact page works
- [ ] Cost Estimator works

### Admin Panel Tests
- [ ] Can access admin panel at `yourdomain.com/admin/content`
- [ ] Can login with credentials
- [ ] Can upload images
- [ ] Can edit content
- [ ] Can add projects
- [ ] Can view inquiries
- [ ] Can manage team members

### Functionality Tests
- [ ] Contact form submits successfully
- [ ] Cost estimator calculates correctly
- [ ] Image uploads work
- [ ] Admin changes reflect on public site
- [ ] Mobile responsive design works

## Security Checks

- [ ] Admin password is strong and unique
- [ ] `.env` file is NOT in GitHub (check .gitignore)
- [ ] No sensitive data in code
- [ ] HTTPS is enabled (Railway does this automatically)
- [ ] Admin panel requires login

## Performance Checks

- [ ] Website loads in under 3 seconds
- [ ] Images are optimized
- [ ] No console errors
- [ ] Mobile version works smoothly

## Final Steps

- [ ] Test website on different devices (phone, tablet, desktop)
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Share website link with friends for feedback
- [ ] Update any business listings with new website URL
- [ ] Add website to Google Search Console
- [ ] Set up Google Analytics (optional)

## Post-Deployment

- [ ] Monitor Railway dashboard for errors
- [ ] Check logs regularly
- [ ] Set up automatic backups
- [ ] Document admin procedures
- [ ] Train team on using admin panel

## Emergency Contacts

- Railway Support: https://railway.app/help
- Domain Provider Support: (your domain provider)
- GitHub Support: https://support.github.com

---

## Quick Commands

```bash
# Build project
npm run build

# Start production server locally
npm run start

# Check for TypeScript errors
npm run check

# Run tests
npm run test

# Push updates to GitHub
git add .
git commit -m "Update description"
git push
```

---

## Common Issues & Solutions

**Issue: Website not loading**
- Solution: Check DNS settings, wait for propagation

**Issue: Images not uploading**
- Solution: Check storage volume is mounted correctly

**Issue: Admin panel not accessible**
- Solution: Verify environment variables are set

**Issue: Database errors**
- Solution: Run `npm run db:push` in Railway console

---

## Monthly Maintenance

- [ ] Check website is running smoothly
- [ ] Review and respond to inquiries
- [ ] Update content as needed
- [ ] Check for any errors in logs
- [ ] Backup database
- [ ] Review hosting costs

---

**Status: Ready to Deploy! 🎉**

Choose your hosting platform and follow the steps above. Good luck!
