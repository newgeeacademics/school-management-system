import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

export function InputPassword(props: React.ComponentProps<'input'>) {
  const [show, setShow] = useState(false);
  return (
    <div className='relative'>
      <Input type={show ? 'text' : 'password'} {...props} />
      <button
        type='button'
        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
        onClick={() => setShow((v) => !v)}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
