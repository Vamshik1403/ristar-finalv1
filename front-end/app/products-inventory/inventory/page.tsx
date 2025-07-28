"use client"

import React from 'react';
import SidebarWithHeader from '../../components/Sidebar';
import ProductsInventoryPage from './InventoryTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <ProductsInventoryPage /> 
    </SidebarWithHeader>
  );
}