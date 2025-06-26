# Magic Link Setup - Required Configuration

## The Issue

Magic links aren't working in production because Supabase needs proper configuration for both local and production environments.

## Production & Local Setup

### 1. Configure Site URLs

Go to: [Auth Settings](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers)

**Set these exact values:**

- **Site URL**: `https://treemat.ch` (for production)
- **Redirect URLs** (add all four):
  - `https://treemat.ch/auth/confirm` (production)
  - `https://treemat.ch/auth/callback` (production)
  - `http://localhost:3000/auth/confirm` (development)
  - `http://localhost:3000/auth/callback` (development)

### 2. Configure Confirm Signup Template

Go to: [Email Templates](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/templates)

**Update the "Confirm signup" template:**

```html
<h2>Access TreeMatch</h2>
<p>Click the link below to sign in or complete your signup:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email"
    >Access TreeMatch</a
  >
</p>
```

### 3. Enable Required Settings

Ensure these are enabled:

- ✅ **Enable email confirmations**: ON
- ✅ **Enable signup**: ON
- ✅ **Allow new user signups**: ON (allows signup with Magic Link template)

## Test the Fix

1. Go to `https://treemat.ch/auth/login` (or `/auth/login` locally)
2. Enter any `@stanford.edu` email
3. Check your email (including spam folder)
4. Click the magic link → Should authenticate successfully

## Expected Result

**Before Fix:**
- Magic link gets stuck on "Loading..." in production
- Works locally but not in production

**After Fix:**
- Magic link works in both production and development
- Email arrives within 1-2 minutes
- Clicking link authenticates and redirects to app

## Why This Works

- **Site URL**: Set to production domain (`https://treemat.ch`) so Supabase trusts it
- **Redirect URLs**: Includes both production and development endpoints
- **Confirm Signup Template**: Uses correct PKCE token format with `{{ .TokenHash }}`
- **Single Template**: Simplified to use only "Confirm signup" template for both login and signup
- **shouldCreateUser: true**: Works for both new users (creates account) and existing users (signs them in)

---

**Action Required:** Update the 2 Supabase dashboard settings above, then test with any Stanford email.
