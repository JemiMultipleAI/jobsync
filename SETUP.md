# JobSync - Setup Guide

## Phase 1 & 2 Implementation Complete ✅

This document outlines what has been implemented and how to set up the project.

## What's Been Implemented

### ✅ Phase 1: Backend Infrastructure
- **Next.js Configuration**: Removed static export, enabled API routes
- **Database Connection**: MongoDB connection utility with connection pooling
- **Data Models**: User, Job, Company, and Application schemas
- **JWT Authentication**: Token generation and verification utilities
- **Authentication APIs**: Register, Login, Logout endpoints
- **Profile APIs**: GET and PUT profile endpoints
- **File Upload APIs**: Resume and profile image upload endpoints

### ✅ Phase 2: Core Backend Features
- **Job CRUD APIs**: Create, Read, Update, Delete jobs
- **Company CRUD APIs**: Create, Read, Update, Delete companies
- **Frontend Integration**: Login, Register, and Profile pages connected to real APIs

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/jobsync
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobsync

# JWT Secret (generate a strong random string for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=development

# Supabase Storage (Optional - falls back to local filesystem if not configured)
# Get these from Supabase Dashboard > Settings > API
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (keep secret!)
# SUPABASE_BUCKET_NAME=jobsync-uploads
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Update `MONGODB_URI` in `.env.local`

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get connection string
- Update `MONGODB_URI` in `.env.local`

### 4. Set Up File Storage (Optional)

**Option A: Supabase Storage (Recommended for Production)**
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Storage and create a bucket named `jobsync-uploads`
4. Make the bucket public (Settings > Public bucket)
5. Go to Settings > API and copy your keys
6. Add the following to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_BUCKET_NAME=jobsync-uploads
   ```
7. See `SUPABASE_STORAGE_SETUP.md` for detailed instructions

**Option B: Local Filesystem (Default)**
- If Supabase is not configured, files will be stored in `/public/uploads/`
- This works for development but not recommended for production

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### File Uploads
- `POST /api/auth/upload/resume` - Upload resume (PDF/DOC/DOCX, max 5MB)
- `DELETE /api/auth/upload/resume` - Delete resume
- `POST /api/auth/upload/profile-image` - Upload profile image (JPEG/PNG/WebP, max 2MB)

### Jobs
- `GET /api/jobs` - List jobs (with pagination, filters)
- `POST /api/jobs` - Create job (admin only)
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job (admin only)
- `DELETE /api/jobs/[id]` - Delete job (admin only)

### Companies
- `GET /api/companies` - List companies (with pagination, filters)
- `POST /api/companies` - Create company (admin only)
- `GET /api/companies/[id]` - Get company details
- `PUT /api/companies/[id]` - Update company (admin only)
- `DELETE /api/companies/[id]` - Delete company (admin only)

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── jobs/         # Job CRUD endpoints
│   │   └── companies/    # Company CRUD endpoints
│   ├── auth/             # Auth pages (login, register)
│   ├── user/             # User dashboard pages
│   └── admin/            # Admin dashboard pages
├── lib/
│   ├── api/              # API client utilities (future extraction)
│   ├── auth/             # JWT utilities
│   ├── db/               # Database connection
│   └── models/           # Mongoose models
└── components/           # React components
```

## Authentication Flow

1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server generates JWT token and sets it as HttpOnly cookie
3. Subsequent requests automatically include the cookie
4. Protected routes verify the token via `authenticateRequest` middleware
5. User data is available in `request.user` for authenticated requests

## File Uploads

- Files are stored in `public/uploads/` directory
- Resume: `public/uploads/resumes/`
- Profile images: `public/uploads/profiles/`
- Files are automatically validated for type and size
- Unique filenames prevent conflicts

## Next Steps (Future Phases)

### Phase 3: Advanced Features
- Job application system
- Application status tracking
- Admin backend functionality
- Real-time notifications

### Phase 4: Infrastructure
- Migrate file storage to AWS S3/Cloudinary
- Add MongoDB Atlas Search
- API documentation (OpenAPI/Swagger)
- Error handling improvements
- Rate limiting
- Caching strategy

## Notes

- The architecture is structured for easy extraction to separate services later
- API client functions in `src/lib/api/` can be moved to a separate package
- Database logic in `src/lib/db/` can be extracted to a shared service
- Models in `src/lib/models/` can become a shared package

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running (if local)
- Check connection string format
- Ensure network access is allowed (for Atlas)

### Authentication Issues
- Check JWT_SECRET is set
- Verify cookies are enabled in browser
- Check token expiration settings

### File Upload Issues
- Ensure `public/uploads/` directory exists
- Check file permissions
- Verify file size and type restrictions

