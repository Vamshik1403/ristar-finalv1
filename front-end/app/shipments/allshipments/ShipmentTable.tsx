'use client';

import React, { useEffect, useState } from 'react';
import { Pencil, Search, Trash2, Plus, History, Download, Eye } from 'lucide-react';
import axios from 'axios';
import AddShipmentForm from './AddShipmentForm';
import ViewShipmentModal from './ViewShipmentModal';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateCroPdf } from './generateCroPdf';

const AllShipmentsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewShipment, setViewShipment] = useState<any>(null);
  const [shipments, setShipments] = useState([]);
  const [containerSearch, setContainerSearch] = useState('');

  // Add state for selected containers
  const [selectedContainers, setSelectedContainers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: undefined,
    status: true,
    quotationRefNo: '',
    referenceNumber: '',
    masterBL: '',
    shippingTerm: '',
    date: new Date().toISOString().split('T')[0],
    jobNumber: '',

    // Customer/Company fields
    customerName: '',
    customerId: '',
    consigneeName: '',
    consigneeId: '',
    consigneeAddressBookId: '',
    shipperName: '',
    shipperId: '',
    shipperAddressBookId: '',
    carrierName: '',
    carrierId: '',
    carrierAddressBookId: '',

    // Product fields
    productId: '',
    productName: '',

    // Port fields
    portOfLoading: '',
    portOfDischarge: '',
    podPortId: '',
    polPortId: '',
    enableTranshipmentPort: false,
    transhipmentPortName: '',
    transhipmentPortId: '',

    // Agent fields
    expHandlingAgent: '',
    expHandlingAgentId: '',
    expHandlingAgentAddressBookId: '',
    impHandlingAgent: '',
    impHandlingAgentId: '',
    impHandlingAgentAddressBookId: '',

    // Depot fields
    emptyReturnDepot: '',
    emptyReturnDepotId: '',
    emptyReturnDepotAddressBookId: '',

    // Container fields
    quantity: '',
    containerNumber: '',
    capacity: '',
    tare: '',

    // Date fields
    gateClosingDate: '',
    sobDate: '',
    etaToPod: '',
    estimatedEmptyReturnDate: '',
    gsDate: '',
    sob: '',
    etaTopod: '',
    estimateDate: '',

    // Free days and detention
    freeDays1: '',
    detentionRate1: '',
    freeDays2: '',
    detentionRate2: '',

    // Vessel
    vesselName: '',
  });

  const fetchShipments = async () => {
    try {
      const res = await axios.get('http://localhost:8000/shipment');
      
      // Enhanced sorting with better date handling and fallback to ID
      const sortedData = res.data.sort((a: any, b: any) => {
        // Try to get valid dates from multiple possible fields
        const getValidDate = (item: any) => {
          const dateFields = ['date', 'createdAt', 'updatedAt'];
          for (const field of dateFields) {
            if (item[field]) {
              const date = new Date(item[field]);
              if (!isNaN(date.getTime())) {
                return date;
              }
            }
          }
          return new Date(0); // Fallback to epoch if no valid date
        };

        const dateA = getValidDate(a);
        const dateB = getValidDate(b);

        // First sort by date (descending)
        const dateComparison = dateB.getTime() - dateA.getTime();
        if (dateComparison !== 0) {
          return dateComparison;
        }

        // If dates are equal, sort by job number (descending) as secondary sort
        if (a.jobNumber && b.jobNumber) {
          // Extract numeric part from job number (e.g., "25/00005" -> 5)
          const getJobNumber = (jobNumber: string) => {
            const match = jobNumber.match(/\/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          };
          
          const jobNumA = getJobNumber(a.jobNumber);
          const jobNumB = getJobNumber(b.jobNumber);
          
          if (jobNumA !== jobNumB) {
            return jobNumB - jobNumA; // Descending order
          }
        }
        
        // If job numbers are equal or don't exist, sort by ID (descending) as final fallback
        return (b.id || 0) - (a.id || 0);
      });

      // Debug: Log the raw data first, then sorted data
      console.log('Raw shipments data:', res.data.map((s: any) => ({ 
        id: s.id, 
        date: s.date, 
        jobNumber: s.jobNumber,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      })));

      console.log('Sorted shipments:', sortedData.map((s: any) => ({ 
        id: s.id, 
        date: s.date, 
        jobNumber: s.jobNumber,
        formattedDate: new Date(s.date).toLocaleDateString()
      })));

      setShipments(sortedData);
    } catch (err) {
      console.error('Failed to fetch shipments', err);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this shipment?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/shipment/${id}`);
      await fetchShipments();
    } catch (err) {
      console.error('Failed to delete shipment', err);
      alert('Error deleting shipment.');
    }
  };

  const handleEdit = async (shipment: any) => {
    setFormData({
      id: shipment.id,
      status: true,
      quotationRefNo: shipment.quotationRefNumber || '',
      date: shipment.date ? new Date(shipment.date).toISOString().split('T')[0] : '',
      jobNumber: shipment.jobNumber || '',
      referenceNumber: shipment.refNumber || '',
      masterBL: shipment.masterBL || '',

      // FIX: Ensure shipping term is passed correctly
      shippingTerm: shipment.shippingTerm || '',

      // Field names must match what the form expects
      customerName: shipment.custAddressBookId?.toString() || '',
      customerId: shipment.custAddressBookId?.toString() || '',
      consigneeName: '', // Will be populated by the useEffect in AddShipmentForm
      consigneeId: shipment.consigneeAddressBookId?.toString() || '',
      consigneeAddressBookId: shipment.consigneeAddressBookId,
      shipperName: '', // Will be populated by the useEffect in AddShipmentForm
      shipperId: shipment.shipperAddressBookId?.toString() || '',
      shipperAddressBookId: shipment.shipperAddressBookId,
      carrierId: shipment.carrierAddressBookId?.toString() || '',
      carrierAddressBookId: shipment.carrierAddressBookId,
      carrierName: '', // Will be populated by the useEffect in AddShipmentForm
      
      // FIX: Ensure productId is passed as number, not string
      productId: shipment.productId || '', // Keep as number/empty string
      productName: '', // Will be populated by the useEffect in AddShipmentForm

      // FIX: Port fields - use the actual port IDs for the select components
      polPortId: shipment.polPortId,
      podPortId: shipment.podPortId,
      portOfLoading: shipment.polPortId?.toString() || '', // Use ID, not name
      portOfDischarge: shipment.podPortId?.toString() || '', // Use ID, not name
      enableTranshipmentPort: !!shipment.transhipmentPortId,
      transhipmentPortName: shipment.transhipmentPortId?.toString() || '',
      transhipmentPortId: shipment.transhipmentPortId?.toString() || '',

      // Free days and detention - Form expects these exact field names
      freeDays1: shipment.polFreeDays || '',
      detentionRate1: shipment.polDetentionRate || '',
      freeDays2: shipment.podFreeDays || '',
      detentionRate2: shipment.podDetentionRate || '',

      // Handling agents - Form expects these exact field names
      expHandlingAgent: shipment.expHandlingAgentAddressBookId?.toString() || '',
      expHandlingAgentId: shipment.expHandlingAgentAddressBookId?.toString() || '',
      expHandlingAgentAddressBookId: shipment.expHandlingAgentAddressBookId,
      impHandlingAgent: shipment.impHandlingAgentAddressBookId?.toString() || '',
      impHandlingAgentId: shipment.impHandlingAgentAddressBookId?.toString() || '',
      impHandlingAgentAddressBookId: shipment.impHandlingAgentAddressBookId,

      // FIX: Depot - use the correct field names from the backend
      emptyReturnDepotAddressBookId: shipment.emptyReturnDepotAddressBookId,
      emptyReturnDepot: shipment.emptyReturnDepotAddressBookId?.toString() || '',
      emptyReturnDepotId: shipment.emptyReturnDepotAddressBookId?.toString() || '',

      // Container fields
      quantity: shipment.quantity || '',
      containerNumber: '',
      capacity: '',
      tare: '',

      // Date fields - Form expects these exact field names
      gateClosingDate: shipment.gsDate ? new Date(shipment.gsDate).toISOString().split('T')[0] : '',
      sobDate: shipment.sob ? new Date(shipment.sob).toISOString().split('T')[0] : '',
      etaToPod: shipment.etaTopod ? new Date(shipment.etaTopod).toISOString().split('T')[0] : '',
      estimatedEmptyReturnDate: shipment.estimateDate ? new Date(shipment.estimateDate).toISOString().split('T')[0] : '',
      
      // Additional fields for the useEffect - pass the raw date strings
      gsDate: shipment.gsDate,
      sob: shipment.sob,
      etaTopod: shipment.etaTopod,
      estimateDate: shipment.estimateDate,
      
      // Vessel name
      vesselName: shipment.vesselName || '',
    });

    // Fetch port information for proper port names
    let portsData = [];
    try {
      const portsRes = await fetch("http://localhost:8000/ports");
      portsData = await portsRes.json();
    } catch (err) {
      console.error("Failed to fetch ports for edit mode:", err);
    }

    // Set selected containers with proper port names
    const existingContainers = shipment.containers?.map((container: any) => {
      // Find the port info from the fetched ports data
      const portInfo = portsData.find((port: any) => port.id === container.portId);
      
      return {
        containerNumber: container.containerNumber,
        capacity: container.capacity,
        tare: container.tare,
        inventoryId: container.inventoryId,
        portId: container.portId,
        depotName: container.depotName || '',
        port: portInfo ? { id: portInfo.id, portName: portInfo.portName } : (container.port || null),
      };
    }) || [];

    setSelectedContainers(existingContainers);

    setShowModal(true);
  };

  // Handle view shipment
  const handleView = (shipment: any) => {
    setViewShipment(shipment);
    setShowViewModal(true);
  };

  // Add state for allMovements
  const [allMovements, setAllMovements] = useState<any[]>([]);

  useEffect(() => {
    // Fetch allMovements data from backend (update the URL as needed)
    axios.get('http://localhost:8000/shipment')
      .then(res => setAllMovements(res.data))
      .catch(err => console.error('Failed to fetch movements', err));
  }, []);

  const handleDownloadPDF = async (shipmentId: number, containers: any[]) => {
    const getSize = (inventoryId: number) => {
      const container = allMovements.find(m => m.inventoryId === inventoryId);
      return container?.inventory?.containerSize || "N/A";
    };

    await generateCroPdf(shipmentId, containers);
  };


  return (
    <div className="px-4 pt-4 pb-4 bg-white dark:bg-black min-h-screen">
      <div className="flex items-center justify-between mt-0 mb-4">
        <div className="relative mr-4 w-full max-w-sm">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            />
            <Input
              type="text"
              placeholder="Search by container..."
              value={containerSearch}
              onChange={(e) => setContainerSearch(e.target.value)}
              className="pl-10 h-10 bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 text-black dark:text-white placeholder:text-neutral-400 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700"
            />
          </div>
        </div>

        <Button
          onClick={() => {
            setFormData({
              id: undefined,
              status: true,
              quotationRefNo: '',
              referenceNumber: '',
              masterBL: '',
              shippingTerm: '',
              date: new Date().toISOString().split('T')[0],
              jobNumber: '',

              // Customer/Company fields
              customerName: '',
              customerId: '',
              consigneeName: '',
              consigneeId: '',
              consigneeAddressBookId: '',
              shipperName: '',
              shipperId: '',
              shipperAddressBookId: '',
              carrierName: '',
              carrierId: '',
              carrierAddressBookId: '',

              // Product fields
              productId: '',
              productName: '',

              // Port fields
              portOfLoading: '',
              portOfDischarge: '',
              podPortId: '',
              polPortId: '',
              enableTranshipmentPort: false,
              transhipmentPortName: '',
              transhipmentPortId: '',

              // Agent fields
              expHandlingAgent: '',
              expHandlingAgentId: '',
              expHandlingAgentAddressBookId: '',
              impHandlingAgent: '',
              impHandlingAgentId: '',
              impHandlingAgentAddressBookId: '',

              // Depot fields
              emptyReturnDepot: '',
              emptyReturnDepotId: '',
              emptyReturnDepotAddressBookId: '',

              // Container fields
              quantity: '',
              containerNumber: '',
              capacity: '',
              tare: '',

              // Date fields
              gateClosingDate: '',
              sobDate: '',
              etaToPod: '',
              estimatedEmptyReturnDate: '',
              gsDate: '',
              sob: '',
              etaTopod: '',
              estimateDate: '',

              // Free days and detention
              freeDays1: '',
              detentionRate1: '',
              freeDays2: '',
              detentionRate2: '',

              // Vessel
              vesselName: '',
            });
            setSelectedContainers([]);
            setShowModal(true);
          }}
          className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Shipment
        </Button>

        {showModal && (
          <AddShipmentForm
            onClose={() => {
              setShowModal(false);
              setSelectedContainers([]);
            }}
            formTitle={formData.id ? 'Edit Shipment' : 'New Shipment Job'}
            form={formData}
            setForm={setFormData}
            selectedContainers={selectedContainers}
            setSelectedContainers={setSelectedContainers}
            refreshShipments={fetchShipments}
          />
        )}

        {/* View Modal */}
        {showViewModal && viewShipment && (
          <ViewShipmentModal
            shipment={viewShipment}
            onClose={() => {
              setShowViewModal(false);
            }}
            onDownload={() => handleDownloadPDF(viewShipment.id, viewShipment.containers ?? [])}
            onEdit={() => {
              // Close view modal first
              setShowViewModal(false);
              
              // Then trigger edit with a slight delay
              setTimeout(() => {
                handleEdit(viewShipment);
              }, 100);
            }}
          />
        )}
      </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-x-auto shadow-sm">
        <Table>
          <TableHeader className="bg-neutral-100 dark:bg-neutral-900">
            <TableRow className="hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 border-neutral-200 dark:border-neutral-800">
              <TableHead className="text-black dark:text-neutral-200 font-medium">Shipment No.</TableHead>
              <TableHead className="text-black dark:text-neutral-200 font-medium">Date</TableHead>
              <TableHead className="text-black dark:text-neutral-200 font-medium">Customer</TableHead>
              <TableHead className="text-black dark:text-neutral-200 font-medium">Shipper</TableHead>
              <TableHead className="text-black dark:text-neutral-200 font-medium">Product</TableHead>
              <TableHead className="text-black dark:text-neutral-200 font-medium">Ports</TableHead>
              <TableHead className="text-black dark:text-neutral-200 font-medium">Containers</TableHead>
              <TableHead className="text-black dark:text-neutral-200 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-neutral-400 py-6 bg-white dark:bg-black">
                  No shipments found.
                </TableCell>
              </TableRow>
            ) : (
              shipments
                .filter((s: any) => {
                  // If search is empty, show all shipments
                  if (!containerSearch.trim()) return true;

                  // If containers array doesn't exist or is empty, don't filter it out
                  if (!s.containers || s.containers.length === 0) return false;

                  // Otherwise check if any container matches search
                  return s.containers.some((c: any) =>
                    c.containerNumber?.toLowerCase().includes(containerSearch.toLowerCase())
                  );
                })
                .map((shipment: any) => (
                  <TableRow
                    key={shipment.id}
                    className="text-black dark:text-white border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    <TableCell className="font-medium">{shipment.jobNumber}</TableCell>
                    <TableCell>{new Date(shipment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{shipment.customerAddressBook?.companyName || '-'}</TableCell>
                    <TableCell>{shipment.shipperAddressBook?.companyName || '-'}</TableCell>
                    <TableCell>{shipment.product?.productName || '-'}</TableCell>
                    <TableCell>{shipment.polPort?.portName || '-'} → {shipment.podPort?.portName || '-'}</TableCell>
                    <TableCell>
                      {(shipment.containers ?? [])
                        .map((c: any) => c.containerNumber)
                        .join(', ') || '-'}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        onClick={() => handleView(shipment)}
                        title="View Details"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-900/40 cursor-pointer dark:hover:bg-purple-900/40"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        onClick={() => handleEdit(shipment)}
                        title="Edit"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 cursor-pointer dark:hover:bg-blue-900/40"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(shipment.id)}
                        title="Delete"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/40 cursor-pointer dark:hover:bg-red-900/40"
                      >
                        <Trash2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-900/40 cursor-pointer dark:hover:bg-green-900/40"
                        title="Download PDF"
                        onClick={() => handleDownloadPDF(shipment.id, shipment.containers ?? [])}
                      >
                        <Download size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AllShipmentsPage;