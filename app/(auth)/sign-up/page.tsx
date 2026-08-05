import type { Metadata } from 'next'

import { SignUpForm } from '@/components/auth/sign-up-form'

export const metadata: Metadata = {
  title: 'Create a farmer account',
  description:
    'Register your farm on WiMakit. Registrations are verified by platform staff before going live.',
}

export default function SignUpPage() {
  return <SignUpForm />
}
