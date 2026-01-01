# 5R Associates - Production Hosting Guide

## 📁 Hosting-Ready Structure

Your project is now organized for easy deployment on any hosting platform.

### Directory Structure
```
5r-associates/
├── backend/               # Server-side code
│   ├── config/           # Configuration files
│   ├── controllers/      # API controllers (Phase 2)
│   ├── middleware/       # Auth, workflow, upload middleware
│   ├── routes/           # API routes (Phase 2)
│   ├── utils/            # Helper functions
│   ├── prisma/           # Database schema
│   └── server.js         # ✓ Main server file (hosting entry point)
├── frontend/             # Client-side code (served statically)
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript modules
│   ├── content/          # Language files (en, kn)
│   └── pages/            # HTML pages
├── uploads/              # User uploaded files (create on server)
├── generated_pdfs/       # Generated quotations/invoices
├── .env                  # Environment variables (DO NOT COMMIT)
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
└── README.md             # Documentation

## 🚀 Deployment Options

### Option 1: Render.com (Recommended - Free Tier)
1. Push code to GitHub
2. Connect Render to your repo: https://dashboard.render.com
3. Create new "Web Service"
4. Build Command: `npm install && npm run prisma:generate`
5. Start Command: `npm start`
6. Add environment variables from .env
7. Add PostgreSQL database (free tier available)

### Option 2: Railway.app (Easy Deploy)
1. Visit: https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add PostgreSQL database from Railway
5. Set environment variables
6. Deploy automatically

### Option 3: Heroku
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Commands:
   ```bash
   heroku login
   heroku create 5r-associates-app
   heroku addons:create heroku-postgresql:hobby-dev
   git push heroku main
   ```

### Option 4: VPS (DigitalOcean, AWS, Linode)
1. Install Node.js 18+ and PostgreSQL
2. Clone repository
3. Run setup commands:
   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:push
   npm start
   ```
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "5r-associates"
   pm2 startup
   pm2 save
   ```

## 🔧 Environment Variables Required

Create `.env` file with:
```env
# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Database (provided by hosting platform)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT Authentication
JWT_SECRET=your-super-secret-key-min-32-chars

# Razorpay (get from https://razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# SendGrid (get from https://sendgrid.com)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Company Details
COMPANY_NAME=5R Associates
COMPANY_EMAIL=contact@5rassociates.com
COMPANY_PHONE=+91-XXXXXXXXXX
COMPANY_ADDRESS=Your Office Address
COMPANY_GST_NUMBER=29XXXXXXXXXXXXX

# Settings
GST_RATE=18
```

## 📡 Static File Serving

Server automatically serves:
- **Frontend pages**: `http://yourdomain.com/frontend/pages/auth/login.html`
- **CSS**: `http://yourdomain.com/css/styles.css`
- **JavaScript**: `http://yourdomain.com/js/api.js`
- **Uploads**: `http://yourdomain.com/uploads/filename.jpg`
- **PDFs**: `http://yourdomain.com/pdfs/quotation.pdf`
- **Root**: Redirects to login page automatically

## 🗂️ Required Folders (Created Automatically)

These folders are created on first upload:
- `uploads/` - User uploaded files
- `generated_pdfs/` - Quotations and invoices

## 🔒 Security Checklist

Before hosting:
- ✅ .env file is in .gitignore (never commit secrets)
- ✅ JWT_SECRET is strong random string (32+ characters)
- ✅ Database uses SSL in production
- ✅ CORS configured for your domain only
- ✅ Rate limiting added (optional, recommended)
- ✅ HTTPS enabled on hosting platform
- ✅ Regular database backups configured

## 🌐 DNS & Domain Setup

After deployment:
1. Get deployment URL (e.g., https://5r-associates.onrender.com)
2. Purchase domain (Namecheap, GoDaddy, etc.)
3. Add DNS records:
   - Type: CNAME
   - Name: @ or www
   - Value: your-app.onrender.com
4. Update FRONTEND_URL in .env

## 📊 Post-Deployment Testing

Test these URLs after deployment:
1. Health check: `https://yourdomain.com/health`
2. Login page: `https://yourdomain.com/`
3. Sign up page: `https://yourdomain.com/frontend/pages/auth/signup.html`
4. API test: `https://yourdomain.com/api/auth/login` (after Phase 2)

## 🔄 Updates & Maintenance

To push updates:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Most platforms auto-deploy on git push.

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment

---

**Current Status**: ✅ Structure is hosting-ready
**Next Step**: Complete Phase 2 (API implementation) from SETUP_CHECKLIST.html
