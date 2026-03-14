# Uploads Directory

This directory stores uploaded files for local development.

- Images uploaded through the admin panel are stored here
- Files are served statically at `/uploads/` URL path
- This directory is excluded from version control (see .gitignore)

## Structure

```
uploads/
├── images/          # User-uploaded images
├── documents/       # Document uploads
└── contracts/       # Contract files
```

## Production

In production, files should be stored in a cloud storage service like AWS S3, not in this local directory.