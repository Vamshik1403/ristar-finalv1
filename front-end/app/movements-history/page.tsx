import React from 'react';
import SidebarWithHeader from '../components/Sidebar';
import MovementHistoryTable from './MovementHistoryTable';

const MovementsHistoryPage = () => {
  return (
    <SidebarWithHeader>
      <MovementHistoryTable/>
    </SidebarWithHeader>
  );
};

export default MovementsHistoryPage; 