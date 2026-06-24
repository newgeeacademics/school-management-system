import React from 'react';

import { KeyRound } from 'lucide-react';

import { useLoginIdPreview } from '@/hooks/useLoginIdPreview';

type LoginIdPreviewProps = {
  firstName: string;
  lastName: string;
  className?: string;
};

export const LoginIdPreview: React.FC<LoginIdPreviewProps> = ({
  firstName,
  lastName,
  className,
}) => {
  const { loginId, loading } = useLoginIdPreview(firstName, lastName);

  if (!firstName.trim() || !lastName.trim()) {
    return null;
  }

  return (
    <p
      className={`flex items-center gap-1.5 text-[11px] text-muted-foreground ${className ?? ''}`}
    >
      <KeyRound className='size-3 shrink-0' aria-hidden />
      <span>
        Identifiant de connexion généré automatiquement
        {loading ? '…' : loginId ? ` : ${loginId}` : ' (à la création)'}
      </span>
    </p>
  );
};
