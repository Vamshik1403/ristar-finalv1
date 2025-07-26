"use client";

import SidebarWithHeader from '@/app/components/Sidebar';
import QuotationClientWrapper from './QuotationClientWrapper';


export default function Quotation() {


  return (
    <SidebarWithHeader>
      <QuotationClientWrapper />
    </SidebarWithHeader>
  );
}