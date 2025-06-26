# Magic Link Setup - Required Configuration

## The Issue

Magic links aren't being sent because Supabase needs proper configuration for the PKCE flow used by Next.js.

## Quick Fix (Takes 2 minutes)

### 1. Configure Site URLs

Go to: [Auth Settings](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers)

**Set these exact values:**

- **Site URL**: `http://localhost:3000`
- **Redirect URLs** (add both):
  - `http://localhost:3000/auth/confirm`
  - `http://localhost:3000/auth/callback`

### 2. Fix Email Template

Go to: [Email Templates](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/templates)

**Replace the Magic Link template with:**

```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email"
    >Log In</a
  >
</p>
```

### 3. Verify Settings

Ensure these are enabled:

- ✅ **Enable email confirmations**: ON
- ✅ **Enable signup**: ON

## Test the Fix

1. Go to `/auth/login`
2. Enter any `@stanford.edu` email
3. Check your email (including spam folder)
4. Click the magic link → Should authenticate successfully

## Expected Result

**Before Fix:**

- Magic link request appears to succeed
- No email arrives
- No error in Resend dashboard

**After Fix:**

- Magic link request succeeds
- Email arrives within 1-2 minutes
- Clicking link authenticates and redirects to app

## Why This Works

- **Site URL**: Tells Supabase what domain to trust
- **Redirect URLs**: Allows the auth callback endpoints
- **Email Template**: Uses correct PKCE token format with `{{ .TokenHash }}`
- **Confirm Route**: Already exists at `/auth/confirm/route.ts`

---

**Action Required:** Update the 2 Supabase dashboard settings above, then test with any Stanford email.
