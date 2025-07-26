import React from 'react';
import SidebarWithHeader from '@/app/components/Sidebar';
import DepotCleaningTable from './DepotCleaningTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <DepotCleaningTable />
    </SidebarWithHeader>
  );
}