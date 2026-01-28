# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for file uploads in JobSync.

## Why Supabase Storage?

- **Free Tier**: 1 GB storage, 2 GB bandwidth/month
- **Easy Setup**: Just API keys, no complex configuration
- **Built-in CDN**: Fast global delivery
- **Simple API**: Easy to integrate
- **Image Transformations**: Built-in image processing
- **Security**: Row Level Security (RLS) support

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up with GitHub, Google, or email
4. Verify your email if required

## Step 2: Create a New Project

1. Click **New Project**
2. Fill in project details:
   - **Name**: `jobsync` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (for MVP)
3. Click **Create new project**
4. Wait 2-3 minutes for project setup

## Step 3: Create Storage Bucket

1. In your Supabase project dashboard, go to **Storage** in the sidebar
2. Click **New bucket**
3. Configure the bucket:
   - **Name**: `jobsync-uploads` (or your preferred name)
   - **Public bucket**: ✅ **Enable this** (for public file access)
   - **File size limit**: 50 MB (or your preference)
   - **Allowed MIME types**: Leave empty for all types, or specify:
     - For resumes: `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - For images: `image/jpeg,image/png,image/webp`
4. Click **Create bucket**

## Step 4: Get API Keys

1. In Supabase dashboard, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. You'll see:
   - **Project URL**: Copy this (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy this (starts with `eyJ...`)
   - **service_role key**: Click **Reveal** and copy this (⚠️ Keep this secret!)

## Step 5: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_BUCKET_NAME=jobsync-uploads
```

**Important Notes:**
- Replace `xxxxx` with your actual project reference
- Never commit `.env.local` to git
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-side only)
- The `NEXT_PUBLIC_` prefix makes variables available in the browser (for client-side if needed)

## Step 6: Set Up Bucket Policies (Optional but Recommended)

For better security, you can set up Row Level Security policies:

1. Go to **Storage** → Your bucket → **Policies**
2. Create policies for:
   - **Upload**: Users can upload their own files
   - **Read**: Public read access (if bucket is public)
   - **Delete**: Users can delete their own files

**Example Policy (Upload):**
```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'jobsync-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
```

For MVP, you can skip this and use the service role key (which bypasses RLS).

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in to the application
3. Upload a profile image or resume
4. Check your Supabase Storage bucket - you should see the file
5. Verify the file is accessible via the returned URL

## File Structure in Supabase

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

## Troubleshooting

### Files not uploading
- ✅ Check that all environment variables are set correctly
- ✅ Verify bucket name matches exactly
- ✅ Ensure bucket is set to public (or configure RLS policies)
- ✅ Check service role key is correct
- ✅ Review server logs for error messages

### Files not accessible
- ✅ Ensure bucket is set to **Public**
- ✅ Check file path in database matches Supabase path
- ✅ Verify URL format is correct

### 403 Forbidden errors
- ✅ Check bucket is public
- ✅ Verify service role key is correct
- ✅ Check bucket name matches

### Authentication errors
- ✅ Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- ✅ Check `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)
- ✅ Ensure service role key hasn't been rotated

## Fallback to Local Storage

If Supabase is not configured, the application automatically falls back to local filesystem storage in `/public/uploads/`. This is useful for:
- Development/testing
- Quick setup without cloud storage
- Local deployments

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Keep service role key secret** (server-side only)
4. **Use RLS policies** for production (optional but recommended)
5. **Set file size limits** in bucket settings
6. **Monitor usage** in Supabase dashboard

## Cost Considerations

**Free Tier Includes:**
- 1 GB storage
- 2 GB bandwidth/month
- 500 MB database space
- 2 million monthly active users

**After Free Tier:**
- Storage: $0.021 per GB/month
- Bandwidth: $0.09 per GB
- Database: Included in Pro plan ($25/month)

For most small to medium applications, the free tier is sufficient.

## Migration from Local Storage

If you're migrating from local storage:

1. Set up Supabase as described above
2. The application will automatically use Supabase for new uploads
3. Old files in `/public/uploads/` will remain accessible
4. Optionally migrate existing files to Supabase:
   - Upload existing files to Supabase
   - Update database records with new URLs
   - Remove old local files

## Additional Features

Supabase Storage also supports:
- **Image transformations** (resize, crop, etc.)
- **Signed URLs** for temporary access
- **File versioning**
- **CDN caching**

These can be added later if needed.

## Support

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage API Reference](https://supabase.com/docs/reference/javascript/storage)
- [Supabase Discord Community](https://discord.supabase.com)

