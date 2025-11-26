# Cloudflare R2 Storage Setup Guide

This guide will help you set up Cloudflare R2 for file storage in JobSync.

## Why Cloudflare R2?

- **Free Tier**: 10 GB storage, 1M Class A operations, 10M Class B operations
- **No Egress Fees**: Unlimited bandwidth (unlike AWS S3)
- **S3-Compatible**: Easy to use with AWS SDK
- **Fast**: Global CDN included
- **Simple Pricing**: Pay only for what you use beyond free tier

## Step 1: Create Cloudflare Account

1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for a free account
3. Complete email verification

## Step 2: Create R2 Bucket

1. Log in to Cloudflare Dashboard
2. Navigate to **R2** in the sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `jobsync-uploads`)
5. Choose a location (closest to your users)
6. Click **Create bucket**

## Step 3: Create API Token

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure the token:
   - **Token name**: `jobsync-upload-token`
   - **Permissions**: 
     - Object Read & Write
     - Admin Read & Write (optional, for bucket management)
   - **TTL**: Leave empty for no expiration (or set expiration date)
   - **Buckets**: Select your bucket or "All buckets"
4. Click **Create API Token**
5. **IMPORTANT**: Copy the credentials immediately (you won't see them again):
   - Access Key ID
   - Secret Access Key

## Step 4: Get Your Account ID

1. In Cloudflare Dashboard, go to any page
2. Your Account ID is shown in the right sidebar
3. Copy it (you'll need it for the endpoint)

## Step 5: Configure Public Access (Optional)

**Option A: Public Bucket (Easier)**
1. Go to your R2 bucket
2. Click **Settings**
3. Enable **Public Access**
4. Note: Files will be publicly accessible via URL

**Option B: Private Bucket with Presigned URLs (More Secure)**
1. Keep bucket private
2. The code will generate presigned URLs for file access
3. URLs expire after set time (default: 1 hour)

## Step 6: Set Up Custom Domain (Optional)

1. In R2 bucket settings, go to **Public Access**
2. Click **Connect Domain**
3. Add your custom domain (e.g., `cdn.yourdomain.com`)
4. Follow DNS configuration instructions
5. Use this domain in `R2_PUBLIC_URL`

## Step 7: Add Environment Variables

Add these to your `.env.local` file:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET_NAME=jobsync-uploads

# Public URL (choose one):
# Option 1: Use R2 public URL (if bucket is public)
R2_PUBLIC_URL=https://pub-{ACCOUNT_ID}.r2.dev

# Option 2: Use custom domain (if configured)
# R2_PUBLIC_URL=https://cdn.yourdomain.com

# Option 3: Leave empty to use presigned URLs (for private buckets)
# R2_PUBLIC_URL=
```

**Important Notes:**
- Replace `{ACCOUNT_ID}` with your actual Account ID
- Never commit `.env.local` to git
- Keep your Secret Access Key secure

## Step 8: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in to the application
3. Upload a profile image or resume
4. Check your R2 bucket - you should see the file
5. Verify the file is accessible via the returned URL

## Troubleshooting

### Files not uploading
- Check that all environment variables are set correctly
- Verify API token has correct permissions
- Check bucket name matches exactly
- Review server logs for error messages

### Files not accessible
- If using public bucket: Ensure public access is enabled
- If using custom domain: Verify DNS is configured correctly
- If using presigned URLs: Check URL expiration time

### 403 Forbidden errors
- Verify API token permissions
- Check bucket name is correct
- Ensure Account ID is correct

### Endpoint errors
- Verify Account ID is correct
- Check that R2 is enabled in your Cloudflare account
- Ensure you're using the correct endpoint format

## File Structure in R2

Files are organized in folders:
- `resumes/` - User resume files
- `profiles/` - User profile images

Example structure:
```
jobsync-uploads/
  ├── resumes/
  │   ├── 507f1f77bcf86cd799439011-1703123456789.pdf
  │   └── 507f1f77bcf86cd799439012-1703123456790.pdf
  └── profiles/
      ├── 507f1f77bcf86cd799439011-1703123456789.jpg
      └── 507f1f77bcf86cd799439012-1703123456790.png
```

## Fallback to Local Storage

If R2 is not configured, the application automatically falls back to local filesystem storage in `/public/uploads/`. This is useful for:
- Development/testing
- Quick setup without cloud storage
- Local deployments

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API tokens** periodically
4. **Use private buckets** with presigned URLs for sensitive files
5. **Set up CORS** if accessing from web applications
6. **Monitor usage** in Cloudflare dashboard

## Cost Considerations

**Free Tier Includes:**
- 10 GB storage
- 1M Class A operations/month (writes, lists)
- 10M Class B operations/month (reads)

**After Free Tier:**
- Storage: $0.015 per GB/month
- Class A operations: $4.50 per million
- Class B operations: $0.36 per million
- **No egress fees** (unlimited bandwidth)

For most small to medium applications, the free tier is sufficient.

## Migration from Local Storage

If you're migrating from local storage:

1. Set up R2 as described above
2. The application will automatically use R2 for new uploads
3. Old files in `/public/uploads/` will remain accessible
4. Consider migrating existing files to R2:
   - Upload existing files to R2
   - Update database records with new URLs
   - Remove old local files

## Support

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/s3/api/)

