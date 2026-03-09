#!/bin/bash

# Script to create a clean deployment folder on Desktop
# This includes all necessary files for hosting + uploaded images

echo "🚀 Creating deployment folder on Desktop..."

# Create the deployment folder on Desktop
DEPLOY_FOLDER=~/Desktop/blueladder-website-deploy
mkdir -p "$DEPLOY_FOLDER"

echo "📁 Created folder: $DEPLOY_FOLDER"

# Copy all necessary files and folders
echo "📋 Copying project files..."

# Copy main folders
cp -r client "$DEPLOY_FOLDER/"
cp -r server "$DEPLOY_FOLDER/"
cp -r db "$DEPLOY_FOLDER/"

# Copy configuration files
cp package.json "$DEPLOY_FOLDER/"
cp tsconfig.json "$DEPLOY_FOLDER/"
cp vite.config.ts "$DEPLOY_FOLDER/"
cp tailwind.config.js "$DEPLOY_FOLDER/"
cp .prettierrc "$DEPLOY_FOLDER/"
cp .prettierignore "$DEPLOY_FOLDER/"
cp .gitignore "$DEPLOY_FOLDER/"

# Copy patches folder if it exists
if [ -d "patches" ]; then
    cp -r patches "$DEPLOY_FOLDER/"
fi

# Create .env.production template (user will fill this in)
cat > "$DEPLOY_FOLDER/.env.production" << 'EOF'
# Production Environment Variables
# Fill in these values before deploying

NODE_ENV=production
PORT=3000

# Admin Credentials (CHANGE THESE!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!

# JWT Secret (Generate a random string)
JWT_SECRET=change-this-to-random-string-abc123xyz789

# Database URL (Railway will provide this)
DATABASE_URL=

# Optional: Add other environment variables here
EOF

# Create README for deployment folder
cat > "$DEPLOY_FOLDER/README.md" << 'EOF'
# Blueladder Infra Website - Deployment Package

This folder contains everything needed to deploy your website.

## What's Included

✅ All source code (client, server, db folders)
✅ All configuration files
✅ Uploaded images (in client/public/uploads/)
✅ Environment template (.env.production)

## Next Steps

1. **Upload to GitHub:**
   - Open Terminal
   - Navigate to this folder: `cd ~/Desktop/blueladder-website-deploy`
   - Run these commands:
     ```bash
     git init
     git add .
     git commit -m "Initial commit - ready for deployment"
     git branch -M main
     ```
   - Create repository on GitHub: https://github.com/new
   - Name it: `blueladder-infra-website`
   - Then run:
     ```bash
     git remote add origin https://github.com/YOUR-USERNAME/blueladder-infra-website.git
     git push -u origin main
     ```

2. **Deploy to Railway:**
   - Go to https://railway.app
   - Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add environment variables from .env.production

3. **Connect Your Domain:**
   - In Railway: Settings → Domains → Add Custom Domain
   - Update DNS at your domain provider

## Important Files

- `.env.production` - Fill in your passwords and secrets
- `client/public/uploads/` - Your uploaded images
- `package.json` - Project dependencies

## Support

See the deployment guides in the original project folder for detailed instructions.
EOF

echo "✅ All files copied!"
echo ""
echo "📸 Checking for uploaded images..."

# Check if uploads folder exists and copy it
if [ -d "client/public/uploads" ]; then
    echo "✅ Found uploaded images - including them in deployment folder"
    # Images are already copied with the client folder
    IMAGE_COUNT=$(find client/public/uploads -type f | wc -l)
    echo "   📷 Total images: $IMAGE_COUNT"
else
    echo "⚠️  No uploaded images found"
    echo "   You can upload images through the admin panel after deployment"
fi

echo ""
echo "🎉 Deployment folder created successfully!"
echo ""
echo "📍 Location: $DEPLOY_FOLDER"
echo ""
echo "📋 Next steps:"
echo "   1. Open Terminal"
echo "   2. Run: cd ~/Desktop/blueladder-website-deploy"
echo "   3. Follow the instructions in README.md"
echo ""
echo "✨ Your website is ready to deploy!"
