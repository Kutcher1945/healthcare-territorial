# CORS/Private Network Access Fix

## Problem
Browser blocking API requests from healthcare-territorial.vercel.app to admin.smartalmaty.kz with error:
```
Permission was denied for this request to access the `unknown` address space
```

## Solution
Use Vercel's built-in proxy feature to avoid cross-origin requests entirely.

## Changes Made

### 1. Backend (Django) - Optional
Updated middleware to add `Access-Control-Allow-Private-Network: true` header.

**Files changed:**
- `django_admin_panel/django_leaflet/middleware/private_network_cors.py` - Simplified middleware
- `django_admin_panel/django_leaflet/helpers/default_middleware.py` - Registered middleware
- `django_admin_panel/.env` - Added opendata.smartalmaty.kz to CSRF_TRUSTED_ORIGINS

**Note:** These backend changes are not strictly necessary if using the Vercel proxy, but provide defense in depth.

### 2. Frontend (React/Vercel) - **REQUIRED**

Updated API calls to use Vercel proxy instead of direct cross-origin requests.

**Files changed:**
- `src/hooks/useHealthcareData.js` - Now uses `/api_proxy/` on Vercel
- `src/hooks/useRecomendationsData.js` - Now uses `/api_proxy/` on Vercel
- `src/config/api.js` - Created centralized API configuration (for future use)

**Existing file (no changes needed):**
- `vercel.json` - Already configured with proxy rewrites

### How It Works

**Before (CORS issue):**
```
healthcare-territorial.vercel.app → https://admin.smartalmaty.kz/api/v1/...
                                    ↑
                                    Cross-origin request blocked by browser
```

**After (using proxy):**
```
healthcare-territorial.vercel.app → /api_proxy/v1/... (same origin)
                                    ↓
Vercel proxy rewrites to → https://admin.smartalmaty.kz/api/v1/...
                           ↑
                           Server-to-server request (no CORS)
```

## Deployment Instructions

### Frontend (Healthcare Territorial App)
1. Commit and push the changes to the healthcare-territorial repository
2. Deploy to Vercel (automatic on push to main)
3. Test the app - CORS errors should be gone

### Backend (Django Admin) - Optional
1. Commit changes to django_admin_panel repository
2. Deploy to admin.smartalmaty.kz
3. Restart the Django server to load new middleware

## Testing
After deployment, test by:
1. Opening https://healthcare-territorial.vercel.app
2. Opening browser console (F12)
3. Loading the map - should see no CORS errors
4. Verify API calls go to `/api_proxy/v1/healthcare/...` instead of `https://admin.smartalmaty.kz/...`

## Notes
- Local development (localhost) will continue using direct URLs
- Production (Vercel) will use the proxy
- The proxy is transparent - the API responses are identical
- Other components still using direct URLs will need similar updates in the future
