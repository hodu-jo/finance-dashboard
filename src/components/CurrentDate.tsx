'use client';

import { useEffect, useState } from 'react';

export default function CurrentDate() {
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const today = new Date().toLocaleDateString('ko-KR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setDateStr(today);
  }, []);

  return (
    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
      {dateStr || '\u00A0'}
    </p>
  );
}
