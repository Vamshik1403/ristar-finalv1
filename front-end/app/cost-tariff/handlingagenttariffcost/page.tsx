import React from 'react';
import SidebarWithHeader from '../../components/Sidebar';
import CostTariffPage from './HandlingAgentTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <CostTariffPage />
    </SidebarWithHeader>
  );
}