'use client';

import { FORM_SUCCESS_BOX, FORM_SUCCESS_TEXT } from '@/lib/constants/ui';

interface FormSuccessProps {
  message: string;
}

export default function FormSuccess({ message }: FormSuccessProps) {
  return (
    <div className={FORM_SUCCESS_BOX}>
      <p className={FORM_SUCCESS_TEXT}>{message}</p>
    </div>
  );
}
