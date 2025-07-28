import React from 'react';
import SidebarWithHeader from '../../components/Sidebar';
import CurrencyPage from './CurrencyTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <CurrencyPage />
    </SidebarWithHeader>
  );
}