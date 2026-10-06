import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignInForm } from '@/components/refine-ui/form/sign-in-form';
import { getMainAppOrigin } from '@/lib/main-app-url';

export function AuthPage() {
  return (
    <AuthLayout homeHref={`${getMainAppOrigin()}/`} product='Finance'>
      <SignInForm />
    </AuthLayout>
  );
}
