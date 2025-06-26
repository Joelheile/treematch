# Supabase Magic Link Fix for External Users

## Problem
Supabase's default email service only sends to **team members**, not external users like Stanford students.

## Solution Options

### Option 1: Disable Email Confirmations (Recommended for Development)

**Steps:**
1. Go to [Auth Providers](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers)
2. Under "Email" section, **turn OFF** "Enable email confirmations"
3. Save changes

**Result:**
- ✅ External users can sign up immediately without email verification
- ✅ Magic links still work for password reset and sign-in
- ⚠️ Less secure (users don't verify their email)

### Option 2: Switch to Email OTP (6-digit codes)

**Steps:**
1. Go to [Email Templates](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/templates)
2. Edit the "Magic Link" template
3. Replace the content with:
```html
<h2>Your Login Code</h2>
<p>Enter this code to sign in:</p>
<h1>{{ .Token }}</h1>
<p>This code expires in 1 hour.</p>
```
4. Update your auth flow to use OTP verification

**Code Changes Needed:**
```typescript
// 1. Send OTP (same as before)
const { data, error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: true,
  },
})

// 2. Add OTP verification step
const { data, error } = await supabase.auth.verifyOtp({
  email: email,
  token: sixDigitCode, // User enters this
  type: 'email'
})
```

## Immediate Test Fix

For testing RIGHT NOW, use **Option 1**:

1. **Disable email confirmations**: https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers
2. **Turn OFF** "Enable email confirmations" 
3. **Test** with any Stanford email

## Production Recommendation

For production, you should:
1. **Enable custom SMTP** (Resend, SendGrid, etc.)
2. **Keep email confirmations ON** for security
3. **Use branded email templates**

## Verification

After making changes, test with:
```bash
node debug-magic-link.js
```

The script will test both team member emails and external Stanford emails.

---

**Quick Action:** Go to [Auth Settings](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers) and disable email confirmations to allow external users immediately.