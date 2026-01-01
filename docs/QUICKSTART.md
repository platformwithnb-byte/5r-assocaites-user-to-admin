# Quick Start Guide

## Project Setup Instructions

### Prerequisites
- Node.js v18+ installed
- PostgreSQL 14+ running locally
- Git installed
- Visual Studio Code (optional but recommended)

### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- express (web framework)
- @prisma/client (database ORM)
- jsonwebtoken (authentication)
- bcryptjs (password hashing)
- multer (file uploads)
- pdfkit (PDF generation)
- razorpay (payment gateway)
- nodemailer (email service)
- and more...

### Step 2: Configure Environment
```bash
# Create .env file from template
cp .env.example .env

# Edit .env with your values:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (random string for token signing)
# - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (when ready)
# - SENDGRID_API_KEY (optional, uses console fallback)
```

**Important**: Never commit `.env` to git!

### Step 3: Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Create/update database schema
npm run prisma:push

# (Optional) Create sample data with seeds
npm run prisma:seed
```

### Step 4: Start Backend Server
```bash
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║  5R Associates - Construction Service Platform             ║
║  Server running on http://localhost:5000                   ║
║  Environment: development                                  ║
║  Frontend: http://localhost:3000                           ║
╚════════════════════════════════════════════════════════════╝
```

### Step 5: Test Frontend
Open in browser:
- **Login**: http://localhost:5000/frontend/pages/auth/login.html
- **Sign Up**: http://localhost:5000/frontend/pages/auth/signup.html

Or set up a separate frontend server for development.

---

## Project Structure

```
5r-associates-comms-platform/
├── backend/              # Node.js + Express API
│   ├── config/          # Configuration files
│   ├── controllers/      # Business logic (to implement)
│   ├── middleware/       # Auth, workflows, uploads
│   ├── models/          # Database models (to implement)
│   ├── routes/          # API endpoints (to implement)
│   ├── utils/           # Helper functions
│   ├── uploads/         # File storage
│   ├── prisma/          # Prisma schema
│   └── server.js        # Express server entry point
├── frontend/             # HTML/CSS/JS
│   ├── pages/           # HTML pages
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript modules
│   └── content/         # Multi-language JSON files
├── database/             # SQL & migrations
├── package.json         # Dependencies
├── .env.example         # Environment template
├── .gitignore           # Git ignores
├── README.md            # Full documentation
└── IMPLEMENTATION_STATUS.md  # Current progress
```

---

## API Endpoints (To Be Implemented)

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

### Service Requests
- `POST /api/requests` - Create request
- `GET /api/requests` - List requests
- `GET /api/requests/:id` - Get details

### Quotations
- `POST /api/quotations` - Create quotation
- `GET /api/quotations/:id` - Get quotation
- `PUT /api/quotations/:id/approve` - Approve

### Payments
- `POST /api/payments/init` - Initialize payment
- `POST /api/payments/webhook` - Razorpay webhook
- `GET /api/payments/:id` - Get payment status

### Work Progress
- `POST /api/progress` - Upload progress
- `GET /api/progress/:requestId` - Get progress

### PDFs
- `GET /api/pdf/quotation/:id` - Download quotation PDF
- `GET /api/pdf/invoice/:id` - Download invoice PDF

---

## Key Features

### ✓ Service Types
- PAINT-001 (Painting)
- CONST-002 (Construction)
- INTER-003 (Interior Design)
- RENOV-004 (Renovation)
- MSFAB-005 (MS & SS Fabrication)

### ✓ Workflow States
```
REQUESTED → QUOTED → APPROVED → PAYMENT → IN_PROGRESS → COMPLETED
```

### ✓ Cost Calculation
```
Base Service Amount
+ Service Tax
+ GST (18% of base only)
─────────────────────
= Total Price
```

### ✓ Languages
- English (en)
- Kannada (kn)

### ✓ Payment Options
- Advance (custom %)
- Full (100% upfront)
- Milestone (unlimited custom milestones)

---

## Development Tips

### Adding a New API Route

1. **Create controller** in `backend/controllers/`
2. **Create route** in `backend/routes/`
3. **Add to server.js**: `app.use('/api/endpoint', routes)`
4. **Test with Postman/Insomnia**

### Adding Frontend Page

1. **Create HTML** in `backend/pages/{section}/`
2. **Create content file** in `frontend/content/en/` and `frontend/content/kn/`
3. **Use data-i18n attributes** for multi-language
4. **Import i18n.js and api.js** for functionality

### Database Migrations

```bash
# After schema changes
npm run prisma:migrate

# View migrations
npx prisma migrate dev
```

### Debugging

```bash
# Enable detailed logs
DEBUG=* npm run dev

# View database
npx prisma studio
```

---

## Security Reminders

- ✓ Never commit `.env` file
- ✓ Always use strong JWT_SECRET
- ✓ Validate all user inputs
- ✓ Use HTTPS in production
- ✓ Keep dependencies updated: `npm audit fix`
- ✓ Implement rate limiting for APIs
- ✓ Validate file uploads (type & size)

---

## Troubleshooting

### Database Connection Error
```
Error: P1000 - Can't reach database server
```
**Fix**: Check DATABASE_URL in .env, ensure PostgreSQL is running

### Port 5000 Already in Use
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Ensure dependencies are installed
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npm run prisma:generate
```

### Prisma Schema Issues
```bash
# Format and validate schema
npx prisma format
npx prisma validate
```

---

## Next Steps

1. ✓ Initialize Git repository
2. ✓ Create initial commit with message `[INIT] Project setup and structure`
3. Start implementing Phase 2: Backend APIs
4. Build authentication endpoints
5. Implement service request CRUD
6. Add quotation system

---

## Support

For issues, check:
1. IMPLEMENTATION_STATUS.md (current progress)
2. README.md (full documentation)
3. Error messages in console
4. Prisma documentation: https://www.prisma.io/docs/

---

**Last Updated**: December 30, 2025
**Version**: 1.0.0
**Status**: Foundation Phase Complete ✓
