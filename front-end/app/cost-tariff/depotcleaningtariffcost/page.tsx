import React from 'react';
import SidebarWithHeader from '../../components/Sidebar';
import DepotCleaningTable from './DepotCleaningTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <DepotCleaningTable />
    </SidebarWithHeader>
  );
}