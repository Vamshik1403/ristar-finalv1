import React from 'react';
import SidebarWithHeader from '@/app/components/Sidebar';
import CountryPage from './CountriesTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <CountryPage/>
    </SidebarWithHeader>
  );
}