import { redirect } from 'next/navigation'
import { validateReferralCode } from '@/lib/validation'

interface InvitePageProps {
  params: {
    code: string
  }
}

export default function InvitePage({ params }: InvitePageProps) {
  const { code } = params
  
  // Validate referral code before redirecting
  const validCode = validateReferralCode(code)
  
  if (!validCode) {
    // Invalid code - redirect to signup without referral
    redirect('/edit')
  }
  
  // Redirect to signup with validated referral code
  redirect(`/edit?ref=${encodeURIComponent(validCode)}`)
}