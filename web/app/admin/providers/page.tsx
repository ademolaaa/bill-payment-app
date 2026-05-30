'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProvidersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/gateway-routing');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs font-semibold text-slate-400">
      Redirecting to Gateway Routing...
    </div>
  );
}
