import React from 'react';
import SidebarWithHeader from '@/app/components/Sidebar';
import CurrencyPage from './CurrencyTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <CurrencyPage />
    </SidebarWithHeader>
  );
}