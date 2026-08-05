import type { Metadata } from 'next';
import { SuperAdminSignInForm } from '@/components/auth/superadmin-sign-in-form';

export const metadata: Metadata = {
  title: 'Platform Control Sign In',
  description: 'Restricted access control for WiMakit platform SuperAdmin operations.',
};

export default function ControlLoginPage() {
  return <SuperAdminSignInForm />;
}
