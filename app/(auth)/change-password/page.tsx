import { Suspense } from 'react'
import type { Metadata } from 'next'

import { ChangePasswordForm } from '@/components/auth/password-forms'

export const metadata: Metadata = {
  title: 'Set a new password',
  description: 'Replace your temporary WiMakit password with one of your own.',
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={null}>
      <ChangePasswordForm />
    </Suspense>
  )
}
