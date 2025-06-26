# Magic Link Email Fix Guide

## The Problem
Magic link emails are not being delivered because Supabase's default email service has restrictions:
- Only sends to **team members** (not general users)
- **30 emails per hour** rate limit
- **Authorization required** for each email address

## The Solution (Using Supabase Default Email)

### Step 1: Add Team Members
1. Go to your [Supabase Team Settings](https://supabase.com/dashboard/org/xtnmcgxofdicrppcvuab/team)
2. Add any Stanford email addresses you want to test with as team members
3. They will receive an invitation email first

### Step 2: Verify Auth Settings
1. Go to [Auth Providers](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers)
2. Ensure:
   - ✅ **Enable email confirmations** is ON
   - ✅ **Email OTP Expiration** is set (default: 3600 seconds)
   - ✅ **Site URL** is correct: `http://localhost:3000` (for dev)

### Step 3: Check Email Templates
1. Go to [Email Templates](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/templates)
2. Verify the **Magic Link** template contains:
```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
```

### Step 4: Test the Fix
Run the debug script:
```bash
npm install @supabase/supabase-js
node debug-magic-link.js
```

## Alternative: Immediate Fix for Production

If you need magic links working immediately for any email:

### Option A: Disable Email Confirmations (Less Secure)
1. Go to [Auth Providers](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers)
2. Turn OFF "Enable email confirmations"
3. Users can sign up without email verification

### Option B: Use Email OTP Instead
Modify your auth to use 6-digit codes instead of magic links:

```javascript
// In your auth component, add OTP verification
const { data, error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: true,
  },
})

// Then verify with 6-digit code
const { data, error } = await supabase.auth.verifyOtp({
  email: email,
  token: sixDigitCode,
  type: 'email'
})
```

## Expected Behavior After Fix

✅ **Team member emails**: Magic links work immediately  
✅ **Stanford emails**: Work after adding to team  
✅ **Rate limit**: Max 30 emails per hour  
✅ **Email delivery**: Usually within 1-2 minutes  

## Common Issues

- **"Email address not authorized"** → Add email to team members
- **"Rate limit exceeded"** → Wait 1 hour or upgrade plan  
- **No email received** → Check spam folder, verify email template
- **Link expired** → Default expiry is 1 hour

## Monitoring

Check auth logs:
```bash
# View recent auth activity
supabase functions logs auth --project-ref zlggajmzyjrwojzhidlo
```

---

**Quick Fix Summary:**
1. Add test emails to team: https://supabase.com/dashboard/org/xtnmcgxofdicrppcvuab/team
2. Verify auth settings: https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers  
3. Test with: `node debug-magic-link.js`