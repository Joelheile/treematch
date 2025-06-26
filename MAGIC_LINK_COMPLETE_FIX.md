# Complete Magic Link Fix for External Users

## Root Cause
Magic links are **enabled by default** but require proper configuration for external users.

## Required Fixes

### 1. Configure Site URL and Redirect URLs
Go to: [Auth Providers](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers)

**Set these URLs:**
- **Site URL**: `http://localhost:3000` (for development)
- **Redirect URLs**: 
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/`
  - `https://yourdomain.com/auth/callback` (for production)

### 2. Fix Magic Link Email Template for PKCE Flow
Go to: [Email Templates](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/templates)

**Replace the Magic Link template with:**
```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Log In</a></p>
```

### 3. Create Auth Callback Route
Create file: `src/app/auth/confirm/route.ts`

```typescript
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/integrations/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // Redirect to app after successful verification
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Redirect to error page if verification fails
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}
```

### 4. Verify Your AuthProvider Configuration
Your current `signInWithMagicLink` function is correct:

```typescript
const signInWithMagicLink = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
    },
  });
  if (error) throw error;
};
```

### 5. Enable Email Confirmations (IMPORTANT)
Go to: [Auth Providers](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers)

**Make sure "Enable email confirmations" is ON** - this is required for magic links to work properly.

## Testing Steps

1. **Apply all configurations above**
2. **Test with Stanford email**:
```javascript
// In browser console or debug script
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'test@stanford.edu',
  options: {
    emailRedirectTo: 'http://localhost:3000/auth/confirm',
  },
})
console.log('Result:', { data, error })
```

3. **Check email for magic link**
4. **Click magic link** - should redirect to `/auth/confirm` then to `/`

## Expected Behavior After Fix

✅ **External Stanford emails**: Receive magic link emails  
✅ **Magic link clicks**: Successfully authenticate and redirect  
✅ **Automatic signup**: New users are created automatically  
✅ **Rate limiting**: 30 emails per hour (with default service)  

## Troubleshooting

**"Email address not authorized"** 
- This error should NOT occur with proper URL configuration
- Verify Site URL and redirect URLs are set correctly

**"Magic link expired"**
- Links expire after 1 hour by default
- Request a new magic link

**No email received**
- Check spam folder
- Verify email template is set to Magic Link (not OTP)
- Rate limit: max 1 request per 60 seconds per email

---

**Action Items:**
1. ✅ Configure Site URL: `http://localhost:3000`
2. ✅ Add redirect URLs: `http://localhost:3000/auth/confirm`
3. ✅ Update email template with `{{ .TokenHash }}`
4. ✅ Create `/auth/confirm/route.ts`
5. ✅ Test with Stanford email

The magic links will work for external users once these configurations are applied.