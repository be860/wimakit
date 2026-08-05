/* -------------------------------------------------------------------------- */
/*  WiMakit — mock auth (no backend, no real OTP/email/SMS)                    */
/* -------------------------------------------------------------------------- */

import { demoAccounts, type DemoAccount } from '@/lib/farmer/mock-data'

const suspendedAccount: DemoAccount = {
  email: 'alusine.bangura@wimakit.sl',
  password: 'farmer123',
  role: 'Farmer',
  name: 'Alusine Bangura',
  state: 'suspended',
  note: 'Suspended farmer — shows the account-suspended state',
}

export const mockAccounts: DemoAccount[] = [...demoAccounts, suspendedAccount]

/** Accounts surfaced in the "Demo accounts" helper card on sign in. */
export const helperAccounts: DemoAccount[] = demoAccounts

export const MOCK_OTP = '482913'

export function findAccount(identifier: string, password: string) {
  const id = identifier.trim().toLowerCase()
  return mockAccounts.find(
    (a) => a.email.toLowerCase() === id && a.password === password,
  )
}

export function accountExists(identifier: string) {
  const id = identifier.trim().toLowerCase()
  return mockAccounts.some((a) => a.email.toLowerCase() === id)
}

export function passwordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const
  return { score, label: labels[score] }
}
