"use client"

import React from 'react';
import SidebarWithHeader from '../../components/Sidebar';
import ProductsInventoryPage from './ProductTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <ProductsInventoryPage /> 
    </SidebarWithHeader>
  );
}