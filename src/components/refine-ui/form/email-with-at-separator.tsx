export function isCompleteEmail(value: string): boolean {
  const trimmed = value.trim();
  const at = trimmed.indexOf('@');
  return at > 0 && at < trimmed.length - 1;
}

function splitEmail(email: string): { local: string; domain: string } {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at < 0) {
    return { local: trimmed.replace(/@/g, ''), domain: '' };
  }
  return {
    local: trimmed.slice(0, at).replace(/@/g, ''),
    domain: trimmed.slice(at + 1).replace(/@/g, ''),
  };
}

function joinEmail(local: string, domain: string): string {
  const l = local.replace(/@/g, '').trim();
  const d = domain.replace(/@/g, '').trim();
  if (!l && !d) return '';
  if (!d) return l;
  return `${l}@${d}`;
}

function sanitizeLocal(value: string): string {
  return value.replace(/@/g, '').replace(/\s/g, '');
}

function sanitizeDomain(value: string): string {
  return value.replace(/@/g, '').replace(/\s/g, '');
}

type EmailWithAtSeparatorProps = {
  value: string;
  onChange: (value: string) => void;
  localPlaceholder?: string;
  domainPlaceholder?: string;
  required?: boolean;
};

export function EmailWithAtSeparator({
  value,
  onChange,
  localPlaceholder,
  domainPlaceholder,
  required,
}: EmailWithAtSeparatorProps) {
  const { local, domain } = splitEmail(value);

  return (
    <div className='school-register__email'>
      <input
        type='text'
        inputMode='email'
        autoComplete='username'
        value={local}
        onChange={(e) => onChange(joinEmail(sanitizeLocal(e.target.value), domain))}
        placeholder={localPlaceholder}
        required={required}
        aria-label={localPlaceholder}
      />
      <span className='school-register__email-sep' aria-hidden='true'>
        @
      </span>
      <input
        type='text'
        inputMode='email'
        autoComplete='email'
        value={domain}
        onChange={(e) => onChange(joinEmail(local, sanitizeDomain(e.target.value)))}
        placeholder={domainPlaceholder}
        required={required}
        aria-label={domainPlaceholder}
      />
    </div>
  );
}
