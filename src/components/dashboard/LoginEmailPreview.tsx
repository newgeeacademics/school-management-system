import React from 'react';

import { Mail } from 'lucide-react';

import {
  useLoginEmailPreview,
  type LoginEmailRole,
} from '@/hooks/useLoginEmailPreview';

type LoginEmailPreviewProps = {
  firstName: string;
  lastName: string;
  role: LoginEmailRole;
  className?: string;
};

export const LoginEmailPreview: React.FC<LoginEmailPreviewProps> = ({
  firstName,
  lastName,
  role,
  className,
}) => {
  const { email, loading } = useLoginEmailPreview(firstName, lastName, role);

  if (!firstName.trim() || !lastName.trim()) {
    return null;
  }

  return (
    <p
      className={`flex items-center gap-1.5 text-[11px] text-muted-foreground ${className ?? ''}`}
    >
      <Mail className='size-3 shrink-0' aria-hidden />
      <span>
        Identifiant portail généré automatiquement
        {loading ? '…' : email ? ` : ${email}` : ' (à la création)'}
      </span>
    </p>
  );
};
