import React from 'react';;
import SidebarWithHeader from '@/app/components/Sidebar';
import CostTariffPage from './LandTransportTable';
import LandTransportTariff from './LandTransportTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <LandTransportTariff />
    </SidebarWithHeader>
  );
}