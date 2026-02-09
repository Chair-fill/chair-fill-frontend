'use client';

import { FORM_ERROR_BOX, FORM_ERROR_TEXT } from '@/lib/constants/ui';

interface FormErrorProps {
  message: string;
}

export default function FormError({ message }: FormErrorProps) {
  return (
    <div className={FORM_ERROR_BOX}>
      <p className={FORM_ERROR_TEXT}>{message}</p>
    </div>
  );
}
