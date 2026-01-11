# Hosting-Ready Project Structure

## New Folder Organization

This project is now organized for **production hosting** with clear separation:

```
5r-associates-comms-platform/
├── backend/                    # Node.js + Express API Server
│   ├── src/
│   │   ├── config/            # Configuration modules
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Auth, validation, etc.
│   │   ├── models/            # Data access layer
│   │   ├── routes/            # API endpoints
│   │   └── utils/             # Helper functions
│   ├── public/
│   │   └── uploads/           # User uploads (persistent)
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── server.js              # Express entry point
│   ├── package.json           # Backend dependencies
│   ├── .env.example           # Environment template
│   └── .env                   # Local environment (not committed)
│
├── frontend/                   # Static HTML/CSS/JS
│   ├── src/
│   │   ├── pages/             # HTML pages
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   └── admin/
│   │   ├── css/               # Stylesheets
│   │   ├── js/                # JavaScript modules
│   │   └── content/           # i18n JSON files
│   ├── public/
│   │   ├── index.html         # Entry point
│   │   └── assets/            # Images, fonts, etc.
│   ├── package.json           # Frontend dependencies (optional)
│   └── .env.example           # Frontend config template
│
├── docker/                     # Container definitions
│   ├── Dockerfile.backend     # Backend image
│   ├── Dockerfile.frontend    # Frontend image
│   └── docker-compose.yml     # Multi-container orchestration
│
├── scripts/                    # Automation scripts
│   ├── setup.sh               # Initial setup
│   ├── deploy.sh              # Deployment script
│   └── migrate.sh             # Database migrations
│
├── deploy/                     # Deployment configs
│   ├── nginx.conf             # Nginx reverse proxy
│   ├── pm2.json               # PM2 process management
│   └── .env.production        # Production environment
│
├── database/                   # Database schemas
│   └── schema.sql             # SQL documentation
│
├── docs/                       # Documentation
│   └── HOSTING_GUIDE.md       # This file
│
├── package.json               # Root dependencies (optional)
├── .gitignore
├── README.md
└── SETUP_CHECKLIST.html
```

---

## 🚀 Hosting Scenarios

### Scenario 1: Same Server (Backend + Frontend)
```
Single Server
├── Backend API on Port 5000
├── Frontend served from /frontend route
└── Files in: backend/public/
```

### Scenario 2: Separate Servers (Recommended)
```
Backend Server (Port 5000)           Frontend Server (Port 3000)
├── API endpoints                    ├── HTML pages
├── Database connection              ├── CSS/JS
├── File uploads                     └── Assets
└── WebSocket (optional)
```

### Scenario 3: Docker Deployment
```
Docker Compose
├── Backend Container (backend-service)
├── Frontend Container (frontend-service)
└── PostgreSQL Container (db-service)
```

---

## 📁 Key Paths for Hosting

### Backend Paths
| Path | Purpose | Hosting |
|------|---------|---------|
| `backend/src/` | Source code | Deploy only |
| `backend/prisma/` | Database schema | Deploy + migrations |
| `backend/public/uploads/` | User files | **Persistent volume** |
| `backend/.env` | Secrets | Don't commit, inject at deploy |

### Frontend Paths
| Path | Purpose | Hosting |
|------|---------|---------|
| `frontend/src/` | Source code | Deploy only |
| `frontend/public/` | Static assets | CDN optional |
| `frontend/.env` | API endpoint | Change per environment |

### Important
- ✅ `backend/public/uploads/` must be a **persistent volume** (survives container restarts)
- ✅ `.env` files are environment-specific (dev/staging/production)
- ✅ `node_modules/` not committed (generated at deploy time)

---

## 🐳 Docker Deployment (Ready to Use)

### Build & Run
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Containers
- **backend** - Node.js API (port 5000)
- **frontend** - Nginx static server (port 3000)
- **db** - PostgreSQL (port 5432)

---

## 🌍 Environment Configuration

### Development
```
backend/.env                    frontend/.env
├── PORT=5000                   ├── VITE_API_URL=http://localhost:5000
├── NODE_ENV=development        └── VITE_FRONTEND_URL=http://localhost:3000
├── DATABASE_URL=...
└── [other dev configs]
```

### Production
```
backend/.env.production         frontend/.env.production
├── PORT=5000                   ├── VITE_API_URL=https://api.5r-associates.com
├── NODE_ENV=production         └── VITE_FRONTEND_URL=https://5r-associates.com
├── DATABASE_URL=...
└── [other prod configs]
```

---

## 📤 Deployment Steps

### Step 1: Prepare Backend
```bash
cd backend
npm install --production
npm run prisma:push
```

### Step 2: Prepare Frontend
```bash
cd frontend
npm install
npm run build  # If using build tool
```

### Step 3: Start Services
```bash
# Using Docker
docker-compose up -d

# Or using PM2
pm2 start backend/server.js -f deploy/pm2.json
pm2 start frontend --name frontend
```

### Step 4: Reverse Proxy (Nginx)
```nginx
# Route to backend API
location /api/ {
    proxy_pass http://localhost:5000;
}

# Serve frontend
location / {
    root /var/www/frontend/public;
    try_files $uri /index.html;
}
```

---

## 🔐 Security for Hosting

- ✅ Keep `.env` files out of Git
- ✅ Use environment variables for secrets
- ✅ Set proper file permissions on `backend/public/uploads/`
- ✅ Enable HTTPS/SSL certificates
- ✅ Use reverse proxy (Nginx/Apache)
- ✅ Set CORS appropriately for production
- ✅ Use helmet.js for security headers
- ✅ Implement rate limiting

---

## 📊 Performance Optimization

- ✅ Frontend: Use CDN for static assets
- ✅ Backend: Enable caching headers
- ✅ Database: Add indexes (already done in schema)
- ✅ Uploads: Compress images before storing
- ✅ Use gzip compression on all responses

---

## ✅ Pre-Hosting Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] File upload paths writable
- [ ] CORS configured for production domain
- [ ] Security headers enabled
- [ ] SSL certificates ready
- [ ] Docker images built and tested
- [ ] Backup strategy in place
- [ ] Monitoring/logging configured
- [ ] Error tracking set up (Sentry, etc.)

---

## 📞 Next Steps

1. Review Docker configuration in `/docker/`
2. Update `.env` files for your environment
3. Test locally with Docker first
4. Deploy to staging
5. Then production

All paths are now production-ready!
