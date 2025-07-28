import React from 'react';
import SidebarWithHeader from '../../components/Sidebar';
import CountryPage from './CountriesTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <CountryPage/>
    </SidebarWithHeader>
  );
}