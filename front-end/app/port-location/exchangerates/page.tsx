import React from 'react';
import Porttable from './ExchangeRateTable';
import SidebarWithHeader from '../../components/Sidebar';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <Porttable />
    </SidebarWithHeader>
  );
}