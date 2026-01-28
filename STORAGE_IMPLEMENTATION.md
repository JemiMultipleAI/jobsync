# File Storage Implementation

## Overview

JobSync now supports **Cloudflare R2** for cloud file storage with automatic fallback to local filesystem storage. This provides flexibility for both development and production environments.

## Architecture

### Storage Abstraction Layer

The implementation uses a unified storage interface (`src/lib/storage/index.ts`) that automatically:
- Uses **Cloudflare R2** if configured (production)
- Falls back to **local filesystem** if R2 is not configured (development)

### File Organization

Files are organized in folders:
- `resumes/` - User resume files (PDF, DOC, DOCX)
- `profiles/` - User profile images (JPEG, PNG, WebP)

## Implementation Details

### Storage Modules

1. **`src/lib/storage/r2.ts`** - Cloudflare R2 implementation
   - Uses AWS SDK (S3-compatible API)
   - Handles upload, delete, and presigned URL generation
   - Supports public and private buckets

2. **`src/lib/storage/local.ts`** - Local filesystem fallback
   - Stores files in `/public/uploads/`
   - Creates directories automatically
   - Simple file operations

3. **`src/lib/storage/index.ts`** - Unified interface
   - Automatically selects storage method
   - Provides consistent API
   - Handles content type detection

### Updated Routes

- `src/app/api/auth/upload/resume/route.ts` - Resume upload/delete
- `src/app/api/auth/upload/profile-image/route.ts` - Profile image upload

Both routes now:
- Use the unified storage interface
- Automatically delete old files when uploading new ones
- Support both R2 and local storage seamlessly

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# Cloudflare R2 (Optional - falls back to local if not set)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://pub-{ACCOUNT_ID}.r2.dev
# Or use custom domain:
# R2_PUBLIC_URL=https://cdn.yourdomain.com
```

### Setup Steps

1. **For Development (Local Storage):**
   - No configuration needed
   - Files stored in `/public/uploads/`
   - Works out of the box

2. **For Production (Cloudflare R2):**
   - Follow `CLOUDFLARE_R2_SETUP.md` guide
   - Configure environment variables
   - Files automatically use R2

## Features

### Automatic Fallback
- If R2 is not configured → uses local storage
- No code changes needed
- Seamless transition

### File Management
- Automatic old file deletion
- Unique filename generation
- Organized folder structure

### Security
- File type validation
- File size limits
- User authentication required
- Private bucket support (presigned URLs)

## File Limits

- **Resumes**: 5MB max (PDF, DOC, DOCX)
- **Profile Images**: 2MB max (JPEG, PNG, WebP)

## Usage Examples

### Upload File
```typescript
import { uploadFile } from "@/lib/storage";

const result = await uploadFile({
  file: buffer,
  filename: "user-123-resume.pdf",
  folder: "resumes",
});

// Returns: { url: "...", key: "..." }
```

### Delete File
```typescript
import { deleteFile } from "@/lib/storage";

await deleteFile(fileUrlOrKey);
```

## Migration

### From Local to R2

1. Set up R2 (see `CLOUDFLARE_R2_SETUP.md`)
2. Add environment variables
3. New uploads automatically use R2
4. Old local files remain accessible
5. Optionally migrate existing files

### From R2 to Local

1. Remove R2 environment variables
2. System automatically falls back to local
3. Old R2 files remain accessible via URLs

## Benefits

### Cloudflare R2
- ✅ Scalable cloud storage
- ✅ No egress fees
- ✅ Global CDN
- ✅ S3-compatible API
- ✅ Free tier available

### Local Storage
- ✅ No setup required
- ✅ Fast for development
- ✅ No external dependencies
- ✅ Easy to test

## Troubleshooting

### Files not uploading
- Check environment variables are set correctly
- Verify R2 credentials have correct permissions
- Check file size and type limits
- Review server logs for errors

### Files not accessible
- For public bucket: Ensure public access is enabled
- For private bucket: Use presigned URLs
- Check R2_PUBLIC_URL configuration
- Verify custom domain DNS settings

## Next Steps

1. Set up Cloudflare R2 for production
2. Configure custom domain (optional)
3. Set up file cleanup job (optional)
4. Monitor storage usage

