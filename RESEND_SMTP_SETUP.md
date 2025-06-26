# Resend SMTP Setup for TreeMatch

## Step 1: Configure Supabase to Use Resend SMTP

Go to your [Supabase Auth Settings](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/settings/auth) and configure the following SMTP settings:

### SMTP Configuration
```
✅ Enable custom SMTP: ON
✅ SMTP Host: smtp.resend.com
✅ SMTP Port: 587
✅ SMTP User: resend
✅ SMTP Pass: ***REMOVED_RESEND_KEY*** (your RESEND_KEY)
✅ SMTP Sender Name: TreeMatch
✅ SMTP Sender Email: no-reply@treematch.app (or your domain)
```

## Step 2: Update Rate Limits

Go to [Auth Rate Limits](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/rate-limits) and increase the email limits:

```
✅ Email sending rate: 100 emails per hour (instead of 30)
✅ OTP sending rate: 100 OTPs per hour
```

## Step 3: Configure Beautiful Email Templates

Go to [Email Templates](https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/templates) and update the Magic Link template with the beautiful design below.

## Benefits After Setup

✅ **Unlimited Recipients**: Send to any email address, not just team members  
✅ **Better Deliverability**: Professional email service with good reputation  
✅ **Higher Rate Limits**: 100+ emails per hour instead of 30  
✅ **Custom Branding**: Beautiful emails with TreeMatch branding  
✅ **Reliable Delivery**: 99.9% delivery rate with Resend  
✅ **Email Analytics**: Track delivery, opens, clicks in Resend dashboard

## Testing

After configuration, test with:
```bash
node debug-magic-link.js
```

External Stanford emails should now receive beautifully designed magic link emails within seconds!