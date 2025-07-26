import React from 'react';
import SidebarWithHeader from '@/app/components/Sidebar';
import CostTariffPage from './DepotAvgTable';
import DepotAvgCost from './DepotAvgTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <DepotAvgCost />
    </SidebarWithHeader>
  );
}