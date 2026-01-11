# TEST MODE Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start the Server
```bash
cd "backend"
node server.js

# Expected output:
# ✓ Database connected
# 5R Associates - Construction Service Platform
# Server running on http://localhost:5000
```

### Step 2: Login to Admin Panel
1. Open: http://localhost:5000/pages/auth/login.html
2. Email: `admin@test.com`
3. Password: `admin123456`
4. Click "Login"

### Step 3: Test Progress Upload
1. You'll be redirected to dashboard
2. Click "📋 Progress" button on any request (in PAYMENT/IN_PROGRESS status)
3. Or go directly to: http://localhost:5000/pages/admin/progress.html
4. Look for yellow banner: **"⚠️ TEST MODE - Razorpay not integrated yet"**
5. Select a project from the dropdown
6. Fill in: Title, Description, Completion %
7. Upload an image or video (optional)
8. Click "Upload Progress Update"
9. ✅ Done! Progress should appear instantly

---

## 📋 What to Look For

### In Admin Upload Page
- ✅ Yellow banner says "TEST MODE"
- ✅ Project dropdown shows `SVC-20260103-0001 - Construction (PAYMENT)`
- ✅ Upload form accepts images/videos
- ✅ Upload button works without real payment

### In User Dashboard
- ✅ Request status changes from PAYMENT → IN_PROGRESS
- ✅ "📋 Progress" button appears
- ✅ Click to view progress timeline

### In Admin Progress List
- ✅ Progress updates appear with titles and dates
- ✅ Media thumbnails show
- ✅ Delete and mark-complete buttons work

---

## 🧪 Test Data Available

### Test Request (Pre-created in PAYMENT status)
- **Code**: `SVC-20260103-0001`
- **Service**: Construction
- **User Email**: platformwithnb@gmail.com
- **Status**: PAYMENT → Will auto-change to IN_PROGRESS after progress upload

### Test Admin User
- **Email**: `admin@test.com`
- **Password**: `admin123456`
- **Role**: ADMIN

### Test Regular User (for viewing progress)
- **Email**: `platformwithnb@gmail.com`
- **Password**: `user123456`
- **Role**: USER

---

## 🔧 TEST MODE Technical Details

### Enabled Features
- ✅ PAYMENT status requests can upload progress (no payment verification)
- ✅ Status auto-transitions PAYMENT → IN_PROGRESS
- ✅ All progress CRUD operations work
- ✅ Media upload (photos/videos) with storage
- ✅ Progress timeline view for users

### Disabled for Testing
- ❌ Real Razorpay payment verification (set to bypass)
- ❌ Payment status validation

### Preserved for Production
- ✅ All payment validation code kept (not deleted)
- ✅ Structure ready for Razorpay integration
- ✅ Easy switch: just set `TEST_MODE = false`

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| [backend/controllers/progressController.js] | Core logic with TEST_MODE flag |
| [backend/routes/progressRoutes.js] | API endpoints including /eligible |
| [frontend/pages/admin/progress.html] | Admin upload interface |
| [frontend/pages/user/progress.html] | User progress viewer |
| [TEST_MODE_DOCUMENTATION.md] | Complete documentation |

---

## 🔄 API Endpoints for Testing

### Get Eligible Projects
```bash
curl -X GET http://localhost:5000/api/progress/eligible \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response shows PAYMENT status requests in TEST_MODE
```

### Upload Progress
```bash
curl -X POST http://localhost:5000/api/progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "requestId=req-id" \
  -F "title=Daily Update" \
  -F "completionPercent=25" \
  -F "image=@photo.jpg"
```

### View Progress
```bash
curl -X GET http://localhost:5000/api/progress/request/req-id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Verification Checklist

After following the 3-step setup:

- [ ] Server running on http://localhost:5000
- [ ] Can login with admin credentials
- [ ] See yellow TEST_MODE banner on progress page
- [ ] Project dropdown shows `SVC-20260103-0001`
- [ ] Can select project and fill upload form
- [ ] Upload succeeds without payment verification
- [ ] Request status changes to IN_PROGRESS
- [ ] Progress appears in admin list and user view

---

## 🚨 Troubleshooting

### "Cannot connect to server"
- Check if server is running: `node server.js` in backend folder
- Verify port 5000 is not in use: `netstat -ano | findstr :5000`

### "Login failed"
- Verify credentials: admin@test.com / admin123456
- Check .env file exists in backend folder

### "No projects in dropdown"
- Run: `node test-eligible.js` to verify test request exists
- If not found, create test request (script will prompt to create)

### "Upload button doesn't work"
- Check browser console for errors (F12)
- Verify admin token is valid
- Check server logs for API errors

---

## 🎯 Next Steps When Ready

### Integrate Razorpay
1. Get Razorpay API keys from dashboard
2. Add to .env: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
3. Update [backend/controllers/paymentController.js]
4. Set `TEST_MODE = false` in progressController.js
5. Test with real payments

### Remove TEST_MODE (After Razorpay Integration)
1. Change: `const TEST_MODE = false;`
2. Uncomment real payment validation code
3. Delete temp test files
4. Deploy to production

---

## 📞 Support

- Server Port: 5000
- Database: PostgreSQL (auto-connected)
- Frontend Static Files: /pages, /css, /js
- API Base: http://localhost:5000/api

For complete documentation, see [TEST_MODE_DOCUMENTATION.md]

---

**Status**: ✅ Ready for Testing  
**Mode**: DEVELOPMENT (TEST_MODE ENABLED)  
**Last Updated**: 2024  

Enjoy testing Phase 6: Work Progress Tracking! 🎉
