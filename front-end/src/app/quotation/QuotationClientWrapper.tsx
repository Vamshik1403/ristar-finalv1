'use client';

import dynamic from 'next/dynamic';

// Import QuotationTable with no SSR
const QuotationTableNoSSR = dynamic(() => import('./QuotationTable'), { 
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading quotation data...</div>
});

export default function QuotationClientWrapper() {
  return <QuotationTableNoSSR />;
}