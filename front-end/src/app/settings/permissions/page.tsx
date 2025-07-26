import React from 'react';;
import SidebarWithHeader from '@/app/components/Sidebar';
import PermissionTable from './PermissionTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <PermissionTable />
    </SidebarWithHeader>
  );
}