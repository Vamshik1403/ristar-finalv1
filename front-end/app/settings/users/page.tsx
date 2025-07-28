import React from 'react';;
import SidebarWithHeader from '../../components/Sidebar';
import UsersTable from './UsersTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <UsersTable />
    </SidebarWithHeader>
  );
}