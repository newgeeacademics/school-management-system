import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignInForm } from '@/components/refine-ui/form/sign-in-form';
import { useTranslation } from '@/i18n';
import { getUserPortalLoginUrl } from '@/lib/app-urls';

export function AuthPage() {
  const { t } = useTranslation();

  return (
    <AuthLayout
      footer={
        <>
          {t('auth.familiesPrompt')} <a href={getUserPortalLoginUrl()}>{t('auth.familiesLink')}</a>
        </>
      }
    >
      <SignInForm />
    </AuthLayout>
  );
}
