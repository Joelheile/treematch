// Debug script to test magic link functionality
// Run with: node debug-magic-link.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zlggajmzyjrwojzhidlo.supabase.co'
const supabaseKey = '***REMOVED_SUPABASE_ANON_KEY***'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testMagicLink() {
  console.log('🧪 Testing magic link functionality...')
  
  // Test with your email (should work if you're in the org)
  const testEmail = 'joel.heil-escobar@outlook.de'
  
  try {
    console.log(`📧 Attempting to send magic link to: ${testEmail}`)
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        emailRedirectTo: 'http://localhost:3000/',
      },
    })

    if (error) {
      console.error('❌ Magic link failed:', error.message)
      
      // Common error messages and solutions
      if (error.message.includes('Email address not authorized')) {
        console.log('💡 Solution: Add this email to your Supabase team members')
        console.log('   Go to: https://supabase.com/dashboard/org/xtnmcgxofdicrppcvuab/team')
      } else if (error.message.includes('rate limit')) {
        console.log('💡 Solution: Wait before sending another email (30/hour limit)')
      } else if (error.message.includes('Email sending is disabled')) {
        console.log('💡 Solution: Enable email confirmations in Auth settings')
      }
    } else {
      console.log('✅ Magic link sent successfully!')
      console.log('📬 Check your email for the magic link')
      console.log('⏰ Link expires in 1 hour')
    }
  } catch (err) {
    console.error('💥 Unexpected error:', err.message)
  }
}

// Test with a Stanford email format
async function testStanfordEmail() {
  console.log('\n🎓 Testing with Stanford email format...')
  
  // This will likely fail due to authorization restrictions
  const stanfordEmail = 'test@stanford.edu'
  
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: stanfordEmail,
      options: {
        emailRedirectTo: 'http://localhost:3000/',
      },
    })

    if (error) {
      console.error('❌ Stanford email failed:', error.message)
      console.log('💡 Expected: Stanford emails need to be added to team first')
    } else {
      console.log('✅ Stanford email worked!')
    }
  } catch (err) {
    console.error('💥 Unexpected error:', err.message)
  }
}

// Run tests
testMagicLink()
  .then(() => testStanfordEmail())
  .then(() => {
    console.log('\n📋 Summary:')
    console.log('1. Add team members: https://supabase.com/dashboard/org/xtnmcgxofdicrppcvuab/team')
    console.log('2. Check auth settings: https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/providers')
    console.log('3. View email templates: https://supabase.com/dashboard/project/zlggajmzyjrwojzhidlo/auth/templates')
  })