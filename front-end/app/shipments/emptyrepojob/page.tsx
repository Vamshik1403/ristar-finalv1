import React from 'react';
import SidebarWithHeader from '../../components/Sidebar';
import EmptyRepo from './EmptyRepoTable';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <EmptyRepo />
    </SidebarWithHeader>
  );
}