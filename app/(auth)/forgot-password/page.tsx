import type { Metadata } from 'next'

import { ForgotPasswordForm } from '@/components/auth/password-forms'

export const metadata: Metadata = {
  title: 'Reset your password',
  description: 'Request a password reset link for your WiMakit account.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
