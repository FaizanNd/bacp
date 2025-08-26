# BypassAC Hub - Script Sharing Platform

A modern script sharing platform built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 **User Authentication** - Secure signup/login with email verification
- 📝 **Script Sharing** - Upload and share scripts with the community
- 👑 **Role System** - Owner, Admin, and User roles with different permissions
- 💬 **Comments & Likes** - Interactive community features
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Beautiful interface with smooth animations

## Role Hierarchy

### Owner (AV3)
- Must use email: `sircats42@gmail.com`
- Can promote users to admin
- Can post programs in Owner Posts section
- Has all admin privileges

### Admins
- Can verify and delete user scripts
- Can moderate comments
- Cannot promote users or post owner content

### Users
- Can upload scripts
- Can comment and like content
- Can view all public content

## Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. **IMPORTANT**: Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
3. Deploy automatically on push

**Vercel Environment Variables Setup:**
- Go to your Vercel project dashboard
- Navigate to Settings → Environment Variables
- Add both variables for Production, Preview, and Development environments

### Render
1. Connect your GitHub repository to Render
2. **IMPORTANT**: Set environment variables in Render dashboard:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
3. Deploy using the included `render.yaml` configuration

### Netlify
1. Connect your GitHub repository to Netlify
2. **IMPORTANT**: Set environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
3. Deploy using the included `netlify.toml` configuration

## Environment Variables

**CRITICAL**: You must set these environment variables in your hosting platform:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon/public key

**Common deployment issues:**
- White screen = Missing environment variables
- "supabaseUrl is required" error = Environment variables not set correctly
- Make sure to set variables for ALL environments (Production, Preview, Development)
## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Setup

1. Create a new Supabase project
2. Run the migrations in the `supabase/migrations` folder
3. Set up your environment variables
4. The first user with username "AV3" and email "sircats42@gmail.com" becomes the owner

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Hosting**: Vercel, Render, or Netlify

## License

MIT License - feel free to use this project for your own purposes.