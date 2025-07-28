import React from 'react';
import ShipmentsPage from '../allshipments/ShipmentTable';
import SidebarWithHeader from '../../components/Sidebar';
import AllShipmentsPage from '../allshipments/ShipmentTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <AllShipmentsPage />
    </SidebarWithHeader>
  );
}