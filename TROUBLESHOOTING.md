# Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Route /auth/login not found"

#### Problem
The backend is returning a 404 error for `/auth/login` or `/api/auth/login`.

#### Solutions

**1. Check Backend is Running**
```bash
# Verify backend is running
curl http://localhost:5000/health
```

Should return:
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

**2. Verify Backend Routes**
The backend routes should be:
- `POST /api/auth/login` ✅
- `POST /api/auth/register` ✅
- `GET /api/jobs` ✅
- `GET /api/resources` ✅

**3. Check Database is Setup**
```bash
cd server
npm run setup-db
```

**4. Restart Both Servers**
Stop both servers (Ctrl+C) and restart:
```bash
npm run dev
```

**5. Check Backend Logs**
Look for:
- `🚀 Server running on port 5000`
- `📋 API Routes registered`
- Connection messages

**6. Verify Environment File**
Check `server/.env` exists and has:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_here
FRONTEND_URL=http://localhost:3000
```

**7. Check Proxy Configuration**
Verify `src/setupProxy.js` exists and is correct.

**8. Clear Browser Cache**
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache

**9. Check Console for Errors**
Open browser DevTools (F12) and check:
- Network tab for API requests
- Console for errors
- Verify requests go to `/api/auth/login`

---

### Issue: Backend Server Won't Start

**1. Port Already in Use**
```bash
# Windows: Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

Change port in `server/.env`:
```env
PORT=5001
```

**2. Missing Dependencies**
```bash
cd server
npm install
```

**3. Database File Locked**
Delete and recreate:
```bash
cd server
rm database/worklinkph.db
npm run setup-db
```

---

### Issue: Frontend Can't Connect to Backend

**1. CORS Errors**
Check `server/.env`:
```env
FRONTEND_URL=http://localhost:3000
```

**2. Proxy Not Working**
- Verify `src/setupProxy.js` exists
- Restart frontend server
- Check backend is on port 5000

**3. Network Errors**
- Check firewall settings
- Verify both servers are running
- Check browser console for errors

---

### Issue: Database Errors

**1. Database Not Found**
```bash
cd server
npm run setup-db
```

**2. Table Errors**
```bash
cd server
rm database/worklinkph.db
npm run setup-db
npm run seed
```

**3. Migration Errors**
Delete database and recreate:
```bash
cd server
rm -rf database/
npm run setup-db
```

---

### Issue: Authentication Errors

**1. Token Expired**
- Clear localStorage
- Login again

**2. Invalid Token**
- Sign out
- Sign in again

**3. Password Not Working**
- Verify password requirements:
  - At least 6 characters
  - Contains uppercase letter
  - Contains number

---

## Verification Checklist

✅ **Backend Running**
```bash
curl http://localhost:5000/health
```

✅ **Frontend Running**
- Visit `http://localhost:3000`
- Should see WorkLink PH app

✅ **Database Exists**
```bash
cd server
ls database/worklinkph.db
```

✅ **Environment Configured**
- `server/.env` exists
- Has required variables

✅ **Dependencies Installed**
- Root: `node_modules/` exists
- Server: `server/node_modules/` exists

---

## Still Having Issues?

1. **Check Logs**
   - Backend console output
   - Frontend console output
   - Browser DevTools Network tab

2. **Restart Everything**
   ```bash
   # Stop all servers
   # Then:
   npm run dev
   ```

3. **Fresh Start**
   ```bash
   # Delete node_modules
   rm -rf node_modules server/node_modules
   
   # Reinstall
   npm run setup
   ```

4. **Check Ports**
   - Backend: Port 5000
   - Frontend: Port 3000
   - Both should be available

---

## Getting Help

If issues persist:
1. Check error messages carefully
2. Verify all setup steps completed
3. Check backend and frontend logs
4. Verify environment configuration
5. Test backend endpoints directly with curl/Postman

