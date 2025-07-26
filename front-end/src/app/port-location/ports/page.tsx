import React from 'react';
import Porttable from './porttable';
import SidebarWithHeader from '@/app/components/Sidebar';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <Porttable />
    </SidebarWithHeader>
  );
}