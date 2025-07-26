import React from 'react';;
import SidebarWithHeader from '@/app/components/Sidebar';
import DataImportTable from './DataImportTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <DataImportTable />
    </SidebarWithHeader>
  );
}