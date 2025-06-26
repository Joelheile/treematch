# 🚀 Custom SMTP Setup with Resend - Complete Guide

## Step 1: Configure SMTP in Supabase Dashboard

**Go to**: [Authentication Settings](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/settings/auth)

**Scroll down to "SMTP Settings" and configure:**

```
✅ Enable custom SMTP: ON
✅ SMTP Host: smtp.resend.com
✅ SMTP Port: 587 (or 465 for SSL)
✅ SMTP User: resend
✅ SMTP Pass: re_jjwpv21u_2qSRjB3tu5tKqb8XuEsp4N6i
✅ SMTP Sender Name: TreeMatch
✅ SMTP Sender Email: noreply@treematch.app
```

**Note**: Use your actual domain for sender email, or use `noreply@resend.dev` if you don't have a custom domain set up in Resend.

## Step 2: Update Email Template

**Go to**: [Email Templates](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/templates)

**Select "Magic Link" template and replace content with:**

```html
<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TreeMatch - Your Magic Link</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0; padding: 0; background-color: #f9fafb;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-collapse: collapse;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; margin-bottom: 20px;">
                                <svg style="width: 32px; height: 32px; color: white;" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">TreeMatch</h1>
                            <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400; margin: 0;">Connect • Collaborate • Create</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 20px 0;">Welcome to TreeMatch! 🌲</h2>
                            
                            <p style="font-size: 16px; color: #6b7280; margin: 0 0 32px 0; line-height: 1.6;">
                                You're just one click away from joining Stanford's most vibrant community for student collaboration and project building.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="text-align: center; padding: 40px 0;">
                                        <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email" 
                                           style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(220, 38, 38, 0.25);">
                                            🚀 Access TreeMatch
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Notice -->
                            <div style="background-color: #f3f4f6; border-left: 4px solid #dc2626; padding: 20px; margin: 32px 0; border-radius: 8px;">
                                <h3 style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">🔒 Security Notice</h3>
                                <p style="color: #6b7280; font-size: 14px; margin: 0;">This link will expire in 1 hour and can only be used once. If you didn't request this, you can safely ignore this email.</p>
                            </div>
                            
                            <!-- Fallback Link -->
                            <div style="height: 1px; background-color: #e5e7eb; margin: 32px 0;"></div>
                            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                                Having trouble with the button? Copy and paste this link into your browser:<br>
                                <span style="color: #dc2626; word-break: break-all;">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email</span>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                            <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px 0;">TreeMatch - Stanford Student Collaboration Platform</p>
                            <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px 0;">Connecting passionate students to build the future together</p>
                            
                            <div style="display: flex; justify-content: center; gap: 24px; margin-top: 16px;">
                                <a href="{{ .SiteURL }}" style="color: #dc2626; text-decoration: none; font-size: 14px; font-weight: 500;">Visit TreeMatch</a>
                                <a href="{{ .SiteURL }}/help" style="color: #dc2626; text-decoration: none; font-size: 14px; font-weight: 500;">Get Help</a>
                                <a href="{{ .SiteURL }}/privacy" style="color: #dc2626; text-decoration: none; font-size: 14px; font-weight: 500;">Privacy Policy</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Step 3: Increase Rate Limits

**Go to**: [Auth Rate Limits](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/rate-limits)

**Update the following:**
```
✅ All endpoints that send emails: 300 emails per hour
✅ All endpoints that send OTPs: 300 OTPs per hour  
✅ Send OTPs or magic links: 30 seconds (instead of 60)
```

## Step 4: Configure URL Settings

**Go to**: [Auth URL Configuration](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/url-configuration)

**Ensure these are set:**
```
✅ Site URL: http://localhost:3000
✅ Redirect URLs: 
   - http://localhost:3000/auth/confirm
   - http://localhost:3000/
   - https://yourdomain.com/auth/confirm (for production)
```

## Step 5: Test the Setup

Run the debug script:
```bash
node debug-magic-link.js
```

**Expected Results:**
- ✅ External Stanford emails receive beautiful magic links
- ✅ Emails arrive within 5-10 seconds  
- ✅ Higher rate limits (300/hour instead of 30)
- ✅ Professional TreeMatch branding
- ✅ Mobile-responsive email design

## Benefits After Setup

🎯 **Unlimited Recipients**: Send to any Stanford email  
🚀 **Fast Delivery**: 5-10 seconds instead of 1-2 minutes  
📈 **Higher Limits**: 300 emails/hour vs 30  
🎨 **Beautiful Design**: Custom TreeMatch branding  
📱 **Mobile Optimized**: Perfect on all devices  
📊 **Analytics**: Track delivery in Resend dashboard  

## Troubleshooting

**If emails don't arrive:**
1. Check Resend dashboard for delivery status
2. Verify SMTP credentials are correct
3. Check spam folder
4. Ensure sender email is verified in Resend

**If template doesn't display correctly:**
- Make sure to copy the entire HTML template
- Save and test with a real email address
- Check Supabase logs for template errors

---

## Summary

After completing these steps, your magic link emails will be:
- **Beautifully designed** with TreeMatch branding
- **Delivered reliably** via Resend SMTP  
- **Available to all users** (not just team members)
- **Mobile-responsive** and professional

The onboarding flow will now work seamlessly for external Stanford users! 🎉