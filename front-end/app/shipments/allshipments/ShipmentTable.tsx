'use client';

import React, { useEffect, useState } from 'react';
import { Pencil, Search, Trash2, Plus, History, Download, Eye, MoreVertical } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateCroPdf } from './generateCroPdf';
import { generateBlPdf, type BLType, type BLFormData } from './generateBlPdf';

// Extended BL form data interface to include all form fields
interface ExtendedBLFormData extends BLFormData {
  shippersName: string;
  shippersAddress: string;
  shippersContactNo: string;
  shippersEmail: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeContactNo: string;
  consigneeEmail: string;
  notifyPartyName: string;
  notifyPartyAddress: string;
  notifyPartyContactNo: string;
  notifyPartyEmail: string;
  deliveryAgentName: string;
  deliveryAgentAddress: string;
  deliveryAgentContactNo: string;
  deliveryAgentEmail: string;
  sealNo: string;
  grossWt: string;
  netWt: string;
  billofLadingDetails: string;
  freightPayableAt: string;
  freightAmount: string;
  Vat: string;
  securityDeposit: string;
  loloCharges: string;
  Orc: string;
  inspectionFees: string;
  reeferPlugInCharges: string;
  specialGearCharges: string;
  riyadhDestinedContainerShifting: string;
  xRayChargesForRiyadhShifting: string;
  lineDetection: string;
  damageRepairCleaningCharges: string;
  shipmentId: number;
  blType: BLType;
}

// Complete BL form data interface for API calls
interface CompleteBLFormData {
  shipmentId?: number;
  shippersName: string;
  shippersAddress: string;
  shippersContactNo: string;
  shippersEmail: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeContactNo: string;
  consigneeEmail: string;
  notifyPartyName: string;
  notifyPartyAddress: string;
  notifyPartyContactNo: string;
  notifyPartyEmail: string;
  deliveryAgentName: string;
  deliveryAgentAddress: string;
  deliveryAgentContactNo: string;
  deliveryAgentEmail: string;
  sealNo: string;
  grossWt: string;
  netWt: string;
  billofLadingDetails: string;
  freightPayableAt: string;
  freightAmount: string;
  Vat: string;
  securityDeposit: string;
  loloCharges: string;
  Orc: string;
  inspectionFees: string;
  reeferPlugInCharges: string;
  specialGearCharges: string;
  riyadhDestinedContainerShifting: string;
  xRayChargesForRiyadhShifting: string;
  lineDetection: string;
  damageRepairCleaningCharges: string;
}

interface Shipment {
  id: number;
  [key: string]: any;
}

const AllShipmentsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewShipment, setViewShipment] = useState<any>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [containerSearch, setContainerSearch] = useState('');

  // Add state for selected containers
  const [selectedContainers, setSelectedContainers] = useState<any[]>([]);

  // Add state for CRO modal
  const [showCroModal, setShowCroModal] = useState(false);
  const [croFormData, setCroFormData] = useState({
    shipmentId: 0,
    date: new Date().toISOString().split('T')[0], // Fixed current date
    houseBL: '',
    shipperRefNo: '',
    shipper: '',
    releaseDate: '',
    pol: '',
    finalDestination: '',
    tankPrep: '',
    pod: '',
    depotName: '',
    depotAddress: '',
    depotContact: '',
    depotEmail: '',
    depotCountry: '',
    depotMobile: '',
    containers: [] as any[]
  });

  // Add state for BL modal with schema fields
  const [showBlModal, setShowBlModal] = useState(false);
  const [currentBlType, setCurrentBlType] = useState<BLType>('original');
  const [blJustSaved, setBlJustSaved] = useState(false);
  const [blGenerationStatus, setBlGenerationStatus] = useState<{[key: number]: {hasDraftBlGenerated: boolean, hasOriginalBLGenerated: boolean, firstGenerationDate: string | null}}>({});
  const [croGenerationStatus, setCroGenerationStatus] = useState<{[key: number]: {hasCroGenerated: boolean, firstCroGenerationDate: string | null}}>({});
  
  // Add state to track copy downloads for each shipment and BL type
  const [blCopyDownloadStatus, setBlCopyDownloadStatus] = useState<{
    [shipmentId: number]: {
      [blType in BLType]: {
        originalDownloaded: boolean;
        secondCopyDownloaded: boolean;
        thirdCopyDownloaded: boolean;
      }
    }
  }>({});
  const [blFormData, setBlFormData] = useState({
    // Core BillofLading schema fields
    shippersName: '',
    shippersAddress: '',
    shippersContactNo: '',
    shippersEmail: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeContactNo: '',
    consigneeEmail: '',
    notifyPartyName: '',
    notifyPartyAddress: '',
    notifyPartyContactNo: '',
    notifyPartyEmail: '',
    containerNos: '',
    sealNo: '',
    grossWt: '',
    netWt: '',
    billofLadingDetails: '',
    freightPayableAt: '',
    deliveryAgentName: '',
    deliveryAgentAddress: '',
    Vat: '',
    deliveryAgentContactNo: '',
    deliveryAgentEmail: '',
    freightAmount: '',
    // Default values for charge fields as shown in the image
    securityDeposit: 'SAR 3000 per dry container & SAR 7,000 per Reefer/Flat rack/special equipment',
    loloCharges: 'SAR 100/150 + VAT',
    Orc: 'SAR 300/450/560 per 20/40/45 for NON-DG and SAR375/562.50/700 per 20′/40′/45′ for DG respectively.',
    inspectionFees: 'SAR 140 per container',
    reeferPlugInCharges: 'SAR 134/day per reefer',
    specialGearCharges: 'SAR 300 per unit for OOG',
    riyadhDestinedContainerShifting: 'SAR 60 per unit',
    xRayChargesForRiyadhShifting: 'SAR 460/560 (20′/40′)',
    lineDetection: 'As per MAWANI regulation article 28/02',
    damageRepairCleaningCharges: 'as per actual, if any.',
    // Fields fetched from shipment
    portOfLoading: '',
    portOfDischarge: '',
    vesselNo: '',
    // Container-specific fields
    containers: [] as Array<{containerNumber: string, sealNumber: string, grossWt: string, netWt: string}>,
    // Additional fields for form management
    shipmentId: 0,
    blType: 'original' as BLType,
    // Add date field for BL generation
    date: new Date().toISOString().split('T')[0]
  });

  // Add state for allMovements
  const [allMovements, setAllMovements] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: undefined,
    status: true,
    quotationRefNo: '',
    referenceNumber: '',
    masterBL: '',
    houseBL: '', // Add houseBL field
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
    
    // Tank preparation
    tankPreparation: '',
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
      
      // Load BL generation status for all shipments
      await fetchBlGenerationStatuses(sortedData);
      
      // Load CRO generation status for all shipments
      await fetchCroGenerationStatuses(sortedData);
      
      // Initialize copy download status for all shipments by checking database
      await initializeBlCopyDownloadStatus(sortedData);
    } catch (err) {
      console.error('Failed to fetch shipments', err);
    }
  };

  // Function to initialize BL copy download status - check database for existing BLs
  const initializeBlCopyDownloadStatus = async (shipments: any[]) => {
    const initialStatus: typeof blCopyDownloadStatus = {};
    
    // Initialize with default values
    shipments.forEach((shipment) => {
      initialStatus[shipment.id] = {
        original: {
          originalDownloaded: false,
          secondCopyDownloaded: false,
          thirdCopyDownloaded: false
        },
        draft: {
          originalDownloaded: false,
          secondCopyDownloaded: false,
          thirdCopyDownloaded: false
        },
        seaway: {
          originalDownloaded: false,
          secondCopyDownloaded: false,
          thirdCopyDownloaded: false
        }
      };
    });

    // Check database for existing BL records to determine originalDownloaded status
    for (const shipment of shipments) {
      try {
        const response = await axios.get(`http://localhost:8000/bill-of-lading/shipment/${shipment.id}`);
        if (response.data) {
          // Handle both array and single object responses
          const blRecords = Array.isArray(response.data) ? response.data : [response.data];
          
          // Check each BL type for existing records
          blRecords.forEach((bl: any) => {
            if (bl.blType && initialStatus[shipment.id]) {
              // If BL record exists, mark originalDownloaded as true
              if (initialStatus[shipment.id][bl.blType as BLType]) {
                initialStatus[shipment.id][bl.blType as BLType].originalDownloaded = true;
              }
            }
          });
        }
      } catch (error) {
        console.log(`No BL records found for shipment ${shipment.id}`);
        // Keep default false values for this shipment
      }
    }
    
    setBlCopyDownloadStatus(initialStatus);
  };

  // Function to fetch BL generation statuses for all shipments
  const fetchBlGenerationStatuses = async (shipments: any[]) => {
    try {
      const statusMap: {[key: number]: {hasDraftBlGenerated: boolean, hasOriginalBLGenerated: boolean, firstGenerationDate: string | null}} = {};
      
      // Fetch BL status for each shipment
      for (const shipment of shipments) {
        try {
          const response = await axios.get(`http://localhost:8000/bill-of-lading/shipment/${shipment.id}`);
          if (response.data) {
            statusMap[shipment.id] = {
              hasDraftBlGenerated: response.data.hasDraftBlGenerated || false,
              hasOriginalBLGenerated: response.data.hasOriginalBLGenerated || false,
              firstGenerationDate: response.data.firstGenerationDate || null
            };
          } else {
            statusMap[shipment.id] = {
              hasDraftBlGenerated: false,
              hasOriginalBLGenerated: false,
              firstGenerationDate: null
            };
          }
        } catch (error) {
          // If no BL exists, set default values
          statusMap[shipment.id] = {
            hasDraftBlGenerated: false,
            hasOriginalBLGenerated: false,
            firstGenerationDate: null
          };
        }
      }
      
      setBlGenerationStatus(statusMap);
    } catch (error) {
      console.error('Failed to fetch BL generation statuses:', error);
    }
  };

  // Function to fetch CRO generation statuses for all shipments
  const fetchCroGenerationStatuses = async (shipments: any[]) => {
    try {
      const statusMap: {[key: number]: {hasCroGenerated: boolean, firstCroGenerationDate: string | null}} = {};
      
      // Set CRO status based on shipment data
      for (const shipment of shipments) {
        statusMap[shipment.id] = {
          hasCroGenerated: shipment.hasCroGenerated || false,
          firstCroGenerationDate: shipment.firstCroGenerationDate || null
        };
      }
      
      setCroGenerationStatus(statusMap);
    } catch (error) {
      console.error('Failed to fetch CRO generation statuses:', error);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    // Fetch allMovements data from backend (update the URL as needed)
    axios.get('http://localhost:8000/shipment')
      .then(res => setAllMovements(res.data))
      .catch(err => console.error('Failed to fetch movements', err));
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
      houseBL: shipment.houseBL || '', // Add houseBL field

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
      
      // Tank preparation field
      tankPreparation: shipment.tankPreparation || '',
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

  const handleDownloadPDF = async (shipmentId: number, containers: any[]) => {
    const getSize = (inventoryId: number) => {
      const container = allMovements.find(m => m.inventoryId === inventoryId);
      return container?.inventory?.containerSize || "N/A";
    };

    await generateCroPdf(shipmentId, containers);
  };

  // Handle opening CRO modal with pre-filled data
  const handleOpenCroModal = async (shipment: any) => {
    try {
      // Fetch fresh data for the shipment
      const [addressBooksRes] = await Promise.all([
        axios.get(`http://localhost:8000/addressbook`),
      ]);
      
      const addressBooks = addressBooksRes.data;
      
      // Get company information
      const shipper = addressBooks.find(
        (ab: any) => ab.id === shipment.shipperAddressBookId
      );
      
      const primaryDepot = addressBooks.find(
        (ab: any) => ab.companyName === (shipment.containers?.[0]?.depotName || "Unknown Depot")
      ) || addressBooks.find(
        (ab: any) => ab.name === (shipment.containers?.[0]?.depotName || "Unknown Depot")
      ) || addressBooks.find(
        (ab: any) => {
          const depotName = shipment.containers?.[0]?.depotName || "Unknown Depot";
          return ab.companyName?.includes(depotName) || depotName.includes(ab.companyName);
        }
      );

      // Pre-fill form data with current shipment data
      setCroFormData({
        shipmentId: shipment.id,
        date: new Date().toISOString().split('T')[0], // Fixed current date
        houseBL: shipment.houseBL || shipment.masterBL || '',
        shipperRefNo: shipment.refNumber || '',
        shipper: shipper?.companyName || '',
        releaseDate: shipment.gsDate ? new Date(shipment.gsDate).toISOString().split('T')[0] : '',
        pol: shipment.polPort?.portName || '',
        finalDestination: shipment.podPort?.portName || '',
        tankPrep: shipment.tankPreparation || 'N/A',
        pod: shipment.podPort?.portName || '',
        depotName: shipment.containers?.[0]?.depotName || 'Unknown Depot',
        depotAddress: primaryDepot?.address || '',
        depotContact: primaryDepot?.phone || '',
        depotEmail: primaryDepot?.email || '',
        depotCountry: primaryDepot?.country?.name || primaryDepot?.country?.countryName || primaryDepot?.country || '',
        depotMobile: (() => {
          // First check contacts array for mobile number
          if (primaryDepot?.contacts && Array.isArray(primaryDepot.contacts) && primaryDepot.contacts.length > 0) {
            const firstContact = primaryDepot.contacts[0];
            if (firstContact?.mobileNo) return firstContact.mobileNo;
            if (firstContact?.mobile) return firstContact.mobile;
            if (firstContact?.phoneNumber) return firstContact.phoneNumber;
          }
          // If not found in contacts, check direct fields
          return primaryDepot?.mobile || primaryDepot?.mobileNumber || primaryDepot?.phoneNumber || primaryDepot?.contact || primaryDepot?.phone || '';
        })(),
        containers: shipment.containers || []
      });
      
      setShowCroModal(true);
    } catch (error) {
      console.error('Error loading CRO data:', error);
    }
  };

  // Handle saving CRO form data
  const handleSaveCroData = () => {
    // Here you can add logic to save the form data to database if needed
    console.log('Saving CRO data:', croFormData);
    // For now, just close the modal
    setShowCroModal(false);
  };

  // Handle editing shipment from CRO modal
  const handleEditShipmentFromCro = async () => {
    try {
      // Find the current shipment data
      const shipmentToEdit = shipments.find(s => s.id === croFormData.shipmentId);
      if (shipmentToEdit) {
        // Close CRO modal first
        setShowCroModal(false);
        // Use existing handleEdit function to open edit form
        await handleEdit(shipmentToEdit);
      }
    } catch (error) {
      console.error('Error opening edit form:', error);
    }
  };

  // Handle downloading PDF with current form data and consistent date logic
  const handleDownloadCroPdf = async () => {
    try {
      // Get the consistent date from generation status or use current date as fallback
      const generationStatus = croGenerationStatus[croFormData.shipmentId];
      const consistentDate = generationStatus?.firstCroGenerationDate 
        ? new Date(generationStatus.firstCroGenerationDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      // Mark CRO as generated and capture first generation date if not already done
      const response = await axios.post(`http://localhost:8000/shipment/mark-cro-generated/${croFormData.shipmentId}`);
      const updatedShipment = response.data;

      // Update CRO generation status
      setCroGenerationStatus(prev => ({
        ...prev,
        [croFormData.shipmentId]: {
          hasCroGenerated: updatedShipment.hasCroGenerated || true,
          firstCroGenerationDate: updatedShipment.firstCroGenerationDate || consistentDate
        }
      }));

      // Generate PDF with consistent date
      await generateCroPdf(croFormData.shipmentId, croFormData.containers, consistentDate);
      setShowCroModal(false);
    } catch (error) {
      console.error('Error generating CRO PDF:', error);
      alert('Error generating CRO PDF. Please try again.');
    }
  };

  // Handle opening BL modal with empty form based on BillofLading schema
  const handleOpenBlModal = async (shipment: any, blType: BLType) => {
    setCurrentBlType(blType);
    setBlJustSaved(false); // Reset save flag initially
    
    try {
      // ALWAYS fetch the latest shipment data first to get current container information
      const latestShipmentResponse = await axios.get(`http://localhost:8000/shipment/${shipment.id}`);
      const latestShipment = latestShipmentResponse.data;
      
      // Try to fetch existing BL data for this shipment
      const response = await axios.get(`http://localhost:8000/bill-of-lading/shipment/${shipment.id}`);
      const existingBl = response.data;
      
      if (existingBl) {
        // Update BL generation status
        setBlGenerationStatus(prev => ({
          ...prev,
          [shipment.id]: {
            hasDraftBlGenerated: existingBl.hasDraftBlGenerated || false,
            hasOriginalBLGenerated: existingBl.hasOriginalBLGenerated || false,
            firstGenerationDate: existingBl.firstGenerationDate || null
          }
        }));

        // Parse existing BL data back into container-specific fields using the SNAPSHOT saved at first generation
        const savedContainerNumbers = existingBl.containerNos
          ? String(existingBl.containerNos)
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0)
          : [];
        const savedSealNumbers = existingBl.sealNo ? String(existingBl.sealNo).split(',').map((s: string) => s.trim()) : [];
        const savedGrossWeights = existingBl.grossWt ? String(existingBl.grossWt).split(',').map((s: string) => s.trim()) : [];
        const savedNetWeights = existingBl.netWt ? String(existingBl.netWt).split(',').map((s: string) => s.trim()) : [];

        // IMPORTANT: Build containers strictly from the saved BL snapshot (do not reflect later shipment edits)
        const currentContainers = savedContainerNumbers.map((num: string, index: number) => ({
          containerNumber: num || '',
          sealNumber: savedSealNumbers[index] || '',
          grossWt: savedGrossWeights[index] || '',
          netWt: savedNetWeights[index] || ''
        }));

        // Get the consistent date from generation status
        const generationStatus = blGenerationStatus[shipment.id];
        const consistentDate = generationStatus?.firstGenerationDate 
          ? new Date(generationStatus.firstGenerationDate).toISOString().split('T')[0]
          : existingBl.firstGenerationDate
          ? new Date(existingBl.firstGenerationDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        setBlFormData({
          shipmentId: shipment.id,
          blType: blType,
          date: consistentDate, // Set consistent date
          // Fill with existing BL data for other fields
          shippersName: existingBl.shippersName || '',
          shippersAddress: existingBl.shippersAddress || '',
          shippersContactNo: existingBl.shippersContactNo || '',
          shippersEmail: existingBl.shippersEmail || '',
          consigneeName: existingBl.consigneeName || '',
          consigneeAddress: existingBl.consigneeAddress || '',
          consigneeContactNo: existingBl.consigneeContactNo || '',
          consigneeEmail: existingBl.consigneeEmail || '',
          notifyPartyName: existingBl.notifyPartyName || '',
          notifyPartyAddress: existingBl.notifyPartyAddress || '',
          notifyPartyContactNo: existingBl.notifyPartyContactNo || '',
          notifyPartyEmail: existingBl.notifyPartyEmail || '',
          // Always use the SNAPSHOT container list from the first generation
          containerNos: currentContainers.map((c: any) => c.containerNumber).join(', '),
          sealNo: existingBl.sealNo || '',
          grossWt: existingBl.grossWt || '',
          netWt: existingBl.netWt || '',
          billofLadingDetails: existingBl.billofLadingDetails || '',
          freightPayableAt: existingBl.freightPayableAt || '',
          deliveryAgentName: existingBl.deliveryAgentName || '',
          deliveryAgentAddress: existingBl.deliveryAgentAddress || '',
          Vat: existingBl.Vat || '',
          deliveryAgentContactNo: existingBl.deliveryAgentContactNo || '',
          deliveryAgentEmail: existingBl.deliveryAgentEmail || '',
          freightAmount: existingBl.freightAmount || '',
          // Charge fields with existing values or defaults
          securityDeposit: existingBl.securityDeposit || 'SAR 3000 per dry container & SAR 7,000 per Reefer/Flat rack/special equipment',
          loloCharges: existingBl.loloCharges || 'SAR 100/150 + VAT',
          Orc: existingBl.Orc || 'SAR 300/450/560 per 20/40/45 for NON-DG and SAR375/562.50/700 per 20′/40′/45′ for DG respectively.',
          inspectionFees: existingBl.inspectionFees || 'SAR 140 per container',
          reeferPlugInCharges: existingBl.reeferPlugInCharges || 'SAR 134/day per reefer',
          specialGearCharges: existingBl.specialGearCharges || 'SAR 300 per unit for OOG',
          riyadhDestinedContainerShifting: existingBl.riyadhDestinedContainerShifting || 'SAR 60 per unit',
          xRayChargesForRiyadhShifting: existingBl.xRayChargesForRiyadhShifting || 'SAR 460/560 (20′/40′)',
          lineDetection: existingBl.lineDetection || 'As per MAWANI regulation article 28/02',
          damageRepairCleaningCharges: existingBl.damageRepairCleaningCharges || 'as per actual, if any.',
          // Prefer saved BL snapshot values; fall back to latest shipment only if missing
          portOfLoading: existingBl.portOfLoading || latestShipment.polPort?.portName || '',
          portOfDischarge: existingBl.portOfDischarge || latestShipment.podPort?.portName || '',
          vesselNo: existingBl.vesselNo || latestShipment.vesselName || '',
          // Container-specific fields - use SNAPSHOT container data
          containers: currentContainers
        });
        // Set the flag to true so download button is visible for existing BL
        setBlJustSaved(true);
      } else {
        // Initialize BL generation status as not generated
        setBlGenerationStatus(prev => ({
          ...prev,
          [shipment.id]: {
            hasDraftBlGenerated: false,
            hasOriginalBLGenerated: false,
            firstGenerationDate: null
          }
        }));

        // Show empty form for first time using LATEST shipment data
        setBlFormData({
          shipmentId: shipment.id,
          blType: blType,
          date: new Date().toISOString().split('T')[0], // Set current date for new BL
          // Empty form fields based on BillofLading schema
          shippersName: '',
          shippersAddress: '',
          shippersContactNo: '',
          shippersEmail: '',
          consigneeName: '',
          consigneeAddress: '',
          consigneeContactNo: '',
          consigneeEmail: '',
          notifyPartyName: '',
          notifyPartyAddress: '',
          notifyPartyContactNo: '',
          notifyPartyEmail: '',
          containerNos: latestShipment.containers?.map((c: any) => c.containerNumber).join(', ') || '',
          sealNo: '',
          grossWt: '',
          netWt: '',
          billofLadingDetails: '',
          freightPayableAt: '',
          deliveryAgentName: '',
          deliveryAgentAddress: '',
          Vat: '',
          deliveryAgentContactNo: '',
          deliveryAgentEmail: '',
          freightAmount: '',
          // Default values for charge fields
          securityDeposit: 'SAR 3000 per dry container & SAR 7,000 per Reefer/Flat rack/special equipment',
          loloCharges: 'SAR 100/150 + VAT',
          Orc: 'SAR 300/450/560 per 20/40/45 for NON-DG and SAR375/562.50/700 per 20′/40′/45′ for DG respectively.',
          inspectionFees: 'SAR 140 per container',
          reeferPlugInCharges: 'SAR 134/day per reefer',
          specialGearCharges: 'SAR 300 per unit for OOG',
          riyadhDestinedContainerShifting: 'SAR 60 per unit',
          xRayChargesForRiyadhShifting: 'SAR 460/560 (20′/40′)',
          lineDetection: 'As per MAWANI regulation article 28/02',
          damageRepairCleaningCharges: 'as per actual, if any.',
          // Fields fetched from LATEST shipment data
          portOfLoading: latestShipment.polPort?.portName || '',
          portOfDischarge: latestShipment.podPort?.portName || '',
          vesselNo: latestShipment.vesselName || '',
          // Container-specific fields - use LATEST shipment data
          containers: latestShipment.containers?.map((c: any) => ({
            containerNumber: c.containerNumber || '',
            sealNumber: c.sealNumber || '',
            grossWt: '',
            netWt: ''
          })) || []
        });
        // Keep blJustSaved as false for new forms
        setBlJustSaved(false);
      }
    } catch (error) {
      console.log('No existing BL found, showing empty form with latest shipment data');
      
      // Always fetch latest shipment data even in catch block
      try {
        const latestShipmentResponse = await axios.get(`http://localhost:8000/shipment/${shipment.id}`);
        const latestShipment = latestShipmentResponse.data;
        
        // Show empty form with LATEST shipment data if no existing data or error occurred
        setBlFormData({
          shipmentId: shipment.id,
          blType: blType,
          date: new Date().toISOString().split('T')[0], // Set current date for new BL
          // Empty form fields based on BillofLading schema
          shippersName: '',
          shippersAddress: '',
          shippersContactNo: '',
          shippersEmail: '',
          consigneeName: '',
          consigneeAddress: '',
          consigneeContactNo: '',
          consigneeEmail: '',
          notifyPartyName: '',
          notifyPartyAddress: '',
          notifyPartyContactNo: '',
          notifyPartyEmail: '',
          containerNos: latestShipment.containers?.map((c: any) => c.containerNumber).join(', ') || '',
          sealNo: '',
          grossWt: '',
          netWt: '',
          billofLadingDetails: '',
          freightPayableAt: '',
          deliveryAgentName: '',
          deliveryAgentAddress: '',
          Vat: '',
          deliveryAgentContactNo: '',
          deliveryAgentEmail: '',
          freightAmount: '',
          // Default values for charge fields
          securityDeposit: 'SAR 3000 per dry container & SAR 7,000 per Reefer/Flat rack/special equipment',
          loloCharges: 'SAR 100/150 + VAT',
          Orc: 'SAR 300/450/560 per 20/40/45 for NON-DG and SAR375/562.50/700 per 20′/40′/45′ for DG respectively.',
          inspectionFees: 'SAR 140 per container',
          reeferPlugInCharges: 'SAR 134/day per reefer',
          specialGearCharges: 'SAR 300 per unit for OOG',
          riyadhDestinedContainerShifting: 'SAR 60 per unit',
          xRayChargesForRiyadhShifting: 'SAR 460/560 (20′/40′)',
          lineDetection: 'As per MAWANI regulation article 28/02',
          damageRepairCleaningCharges: 'as per actual, if any.',
          // Fields fetched from LATEST shipment data
          portOfLoading: latestShipment.polPort?.portName || '',
          portOfDischarge: latestShipment.podPort?.portName || '',
          vesselNo: latestShipment.vesselName || '',
          // Container-specific fields - use LATEST shipment data
          containers: latestShipment.containers?.map((c: any) => ({
            containerNumber: c.containerNumber || '',
            sealNumber: c.sealNumber || '',
            grossWt: '',
            netWt: ''
          })) || []
        });
      } catch (shipmentError) {
        console.error('Error fetching latest shipment data:', shipmentError);
        // Fallback to original shipment data if latest fetch fails
        setBlFormData({
          shipmentId: shipment.id,
          blType: blType,
          date: new Date().toISOString().split('T')[0], // Set current date for new BL
          // Empty form fields based on BillofLading schema
          shippersName: '',
          shippersAddress: '',
          shippersContactNo: '',
          shippersEmail: '',
          consigneeName: '',
          consigneeAddress: '',
          consigneeContactNo: '',
          consigneeEmail: '',
          notifyPartyName: '',
          notifyPartyAddress: '',
          notifyPartyContactNo: '',
          notifyPartyEmail: '',
          containerNos: shipment.containers?.map((c: any) => c.containerNumber).join(', ') || '',
          sealNo: '',
          grossWt: '',
          netWt: '',
          billofLadingDetails: '',
          freightPayableAt: '',
          deliveryAgentName: '',
          deliveryAgentAddress: '',
          Vat: '',
          deliveryAgentContactNo: '',
          deliveryAgentEmail: '',
          freightAmount: '',
          // New charge fields with default values
          securityDeposit: 'SAR 3000 per dry container & SAR 7,000 per Reefer/Flat rack/special equipment',
          loloCharges: 'SAR 100/150 + VAT',
          Orc: 'SAR 300/450/560 per 20/40/45 for NON-DG and SAR375/562.50/700 per 20′/40′/45′ for DG respectively.',
          inspectionFees: 'SAR 140 per container',
          reeferPlugInCharges: 'SAR 134/day per reefer',
          specialGearCharges: 'SAR 300 per unit for OOG',
          riyadhDestinedContainerShifting: 'SAR 60 per unit',
          xRayChargesForRiyadhShifting: 'SAR 460/560 (20′/40′)',
          lineDetection: 'As per MAWANI regulation article 28/02',
          damageRepairCleaningCharges: 'as per actual, if any.',
          // Fields fetched from original shipment data
          portOfLoading: shipment.polPort?.portName || '',
          portOfDischarge: shipment.podPort?.portName || '',
          vesselNo: shipment.vesselName || '',
          // Container-specific fields
          containers: shipment.containers?.map((c: any) => ({
            containerNumber: c.containerNumber || '',
            sealNumber: c.sealNumber || '',
            grossWt: '',
            netWt: ''
          })) || []
        });
      }
      // Keep blJustSaved as false for new forms
      setBlJustSaved(false);
    }
    
    setShowBlModal(true);
  };

  // Handle saving BL form data
  const handleSaveBlData = async () => {
    try {
      // Debug: Log the current form data to see what we're sending
      console.log('Current blFormData before save:', blFormData);
      console.log('Individual container data:', blFormData.containers);
      console.log('Aggregated grossWt:', blFormData.grossWt);
      console.log('Aggregated netWt:', blFormData.netWt);
      console.log('Aggregated sealNo:', blFormData.sealNo);
      console.log('Aggregated containerNos:', blFormData.containerNos);

      // Create the payload without shipmentId for the new endpoint
      const blPayload = {
        shippersName: blFormData.shippersName,
        shippersAddress: blFormData.shippersAddress,
        shippersContactNo: blFormData.shippersContactNo,
        shippersEmail: blFormData.shippersEmail,
        consigneeName: blFormData.consigneeName,
        consigneeAddress: blFormData.consigneeAddress,
        consigneeContactNo: blFormData.consigneeContactNo,
        consigneeEmail: blFormData.consigneeEmail,
        notifyPartyName: blFormData.notifyPartyName,
        notifyPartyAddress: blFormData.notifyPartyAddress,
        notifyPartyContactNo: blFormData.notifyPartyContactNo,
        notifyPartyEmail: blFormData.notifyPartyEmail,
        containerNos: blFormData.containerNos,
        sealNo: blFormData.sealNo,
        grossWt: blFormData.grossWt,
        netWt: blFormData.netWt,
        billofLadingDetails: blFormData.billofLadingDetails,
        freightPayableAt: blFormData.freightPayableAt,
        deliveryAgentName: blFormData.deliveryAgentName,
        deliveryAgentAddress: blFormData.deliveryAgentAddress,
        Vat: blFormData.Vat,
        deliveryAgentContactNo: blFormData.deliveryAgentContactNo,
        deliveryAgentEmail: blFormData.deliveryAgentEmail,
        freightAmount: blFormData.freightAmount,
        portOfLoading: blFormData.portOfLoading,
        portOfDischarge: blFormData.portOfDischarge,
        vesselNo: blFormData.vesselNo,
        // New charge fields
        securityDeposit: blFormData.securityDeposit,
        loloCharges: blFormData.loloCharges,
        Orc: blFormData.Orc,
        inspectionFees: blFormData.inspectionFees,
        reeferPlugInCharges: blFormData.reeferPlugInCharges,
        specialGearCharges: blFormData.specialGearCharges,
        riyadhDestinedContainerShifting: blFormData.riyadhDestinedContainerShifting,
        xRayChargesForRiyadhShifting: blFormData.xRayChargesForRiyadhShifting,
        lineDetection: blFormData.lineDetection,
        damageRepairCleaningCharges: blFormData.damageRepairCleaningCharges,
      };

      // Debug: Log the payload being sent to backend
      console.log('Payload being sent to backend:', blPayload);

      // Use the new generate endpoint that handles creation/update with generation tracking
      const response = await axios.post(`http://localhost:8000/bill-of-lading/generate/${blFormData.shipmentId}`, blPayload);
      const savedBl = response.data;

      console.log('Bill of Lading saved/updated successfully:', savedBl);
      
      // Update BL generation status with the returned data
      setBlGenerationStatus(prev => ({
        ...prev,
        [blFormData.shipmentId]: {
          hasDraftBlGenerated: savedBl.hasDraftBlGenerated || true,
          hasOriginalBLGenerated: savedBl.hasOriginalBLGenerated || false,
          firstGenerationDate: savedBl.firstGenerationDate || new Date().toISOString()
        }
      }));

      alert(`${currentBlType === 'original' ? 'Original' : currentBlType === 'draft' ? 'Draft' : 'Seaway'} Bill of Lading saved successfully!`);
      setBlJustSaved(true); // Show download button and enable update mode
      
      // Close the modal after a short delay to allow user to see the success message
      setTimeout(() => {
        setShowBlModal(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving Bill of Lading:', error);
      alert('Error saving Bill of Lading. Please try again.');
    }
  };

  // Handle editing shipment from BL modal
  const handleEditShipmentFromBl = async () => {
    try {
      // Find the current shipment data
      const shipmentToEdit = shipments.find(s => s.id === blFormData.shipmentId);
      if (shipmentToEdit) {
        // Close BL modal first
        setShowBlModal(false);
        // Use existing handleEdit function to open edit form
        await handleEdit(shipmentToEdit);
      }
    } catch (error) {
      console.error('Error opening edit form:', error);
    }
  };

  // Handle downloading BL PDF with current form data
  const handleDownloadBlPdf = async () => {
    try {
      // Get the consistent date from generation status or use current date as fallback
      const generationStatus = blGenerationStatus[blFormData.shipmentId];
      const consistentDate = generationStatus?.firstGenerationDate 
        ? new Date(generationStatus.firstGenerationDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      // Convert form data to match BLFormData interface structure
      const pdfData: BLFormData = {
        shipmentId: blFormData.shipmentId,
        blType: currentBlType,
        date: consistentDate,
        blNumber: `${currentBlType.toUpperCase()}-${Date.now()}`,
        shipper: blFormData.shippersName,
        consignee: blFormData.consigneeName,
        notifyParty: blFormData.notifyPartyName,
        placeOfAcceptance: '',
        portOfLoading: '',
        portOfDischarge: '',
        placeOfDelivery: '',
        vesselVoyageNo: '',
        containerInfo: '',
        marksNumbers: '',
        descriptionOfGoods: blFormData.billofLadingDetails,
        grossWeight: blFormData.grossWt,
        netWeight: blFormData.netWt,
        shippingMarks: '',
        freightCharges: blFormData.freightAmount,
        freightPayableAt: '',
        numberOfOriginals: '',
        placeOfIssue: '',
        dateOfIssue: consistentDate,
        containers: []
      };
      
      await generateBlPdf(currentBlType, pdfData, blFormData, 0); // 0 = original copy
      
      // If this is an original BL download and hasn't been generated before, mark it as generated
      if (currentBlType === 'original' && !blGenerationStatus[blFormData.shipmentId]?.hasOriginalBLGenerated) {
        try {
          await axios.post(`http://localhost:8000/bill-of-lading/mark-original-generated/${blFormData.shipmentId}`);
          
          // Update the local state to reflect that original BL has been generated
          setBlGenerationStatus(prev => ({
            ...prev,
            [blFormData.shipmentId]: {
              ...prev[blFormData.shipmentId],
              hasOriginalBLGenerated: true
            }
          }));
        } catch (error) {
          console.error('Error marking original BL as generated:', error);
          // Don't block the download process if this fails
        }
      }
      
      // Mark original as downloaded in local state (for UI purposes)
      setBlCopyDownloadStatus(prev => ({
        ...prev,
        [blFormData.shipmentId]: {
          ...prev[blFormData.shipmentId],
          [currentBlType]: {
            ...prev[blFormData.shipmentId]?.[currentBlType],
            originalDownloaded: true,
            secondCopyDownloaded: false,
            thirdCopyDownloaded: false
          }
        }
      }));
      
      setShowBlModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Handler for 2nd copy download
  const handleDownload2ndCopyBlPdf = async (shipmentId: number, blType: BLType) => {
    try {
      // Fetch the latest shipment data to get current container information
      const latestShipmentResponse = await axios.get(`http://localhost:8000/shipment/${shipmentId}`);
      const latestShipment = latestShipmentResponse.data;
      
      // Fetch the existing BL data for this shipment
      const existingBlResponse = await axios.get(`http://localhost:8000/bill-of-lading/shipment/${shipmentId}`);
      const existingBl = existingBlResponse.data;
      
      if (!existingBl) {
        alert('Original BL data not found. Please generate the original BL first.');
        return;
      }

      const generationStatus = blGenerationStatus[shipmentId];
      const consistentDate = generationStatus?.firstGenerationDate 
        ? new Date(generationStatus.firstGenerationDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      // Build BL data using the SNAPSHOT saved at first generation (do not reflect later shipment edits)
      const savedContainerNumbers2 = existingBl.containerNos
        ? String(existingBl.containerNos).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : [];
      const blDataWithCurrentContainers = {
        ...existingBl,
        containerNos: savedContainerNumbers2.join(', '),
        containers: savedContainerNumbers2.map((num: string) => ({
          containerNumber: num,
          sealNumber: '',
          grossWt: '',
          netWt: ''
        }))
      };

      const pdfData: BLFormData = {
        shipmentId: shipmentId,
        blType: blType,
        date: consistentDate,
        blNumber: `${blType.toUpperCase()}-${Date.now()}`,
        shipper: existingBl.shippersName,
        consignee: existingBl.consigneeName,
        notifyParty: existingBl.notifyPartyName,
        placeOfAcceptance: '',
        portOfLoading: '',
        portOfDischarge: '',
        placeOfDelivery: '',
        vesselVoyageNo: '',
        containerInfo: '',
        marksNumbers: '',
        descriptionOfGoods: existingBl.billofLadingDetails,
        grossWeight: existingBl.grossWt,
        netWeight: existingBl.netWt,
        shippingMarks: '',
        freightCharges: existingBl.freightAmount,
        freightPayableAt: '',
        numberOfOriginals: '',
        placeOfIssue: '',
        dateOfIssue: consistentDate,
        containers: []
      };
      
      await generateBlPdf(blType, pdfData, blDataWithCurrentContainers, 1); // 1 = 2nd copy
      
      // Mark 2nd copy as downloaded
      setBlCopyDownloadStatus(prev => ({
        ...prev,
        [shipmentId]: {
          ...prev[shipmentId],
          [blType]: {
            ...prev[shipmentId]?.[blType],
            secondCopyDownloaded: true
          }
        }
      }));
      
    } catch (error) {
      console.error('Error generating 2nd copy PDF:', error);
      alert('Error generating 2nd copy PDF. Please try again.');
    }
  };

  // Handler for 3rd copy download
  const handleDownload3rdCopyBlPdf = async (shipmentId: number, blType: BLType) => {
    try {
      // Fetch the latest shipment data to get current container information
      const latestShipmentResponse = await axios.get(`http://localhost:8000/shipment/${shipmentId}`);
      const latestShipment = latestShipmentResponse.data;
      
      // Fetch the existing BL data for this shipment
      const existingBlResponse = await axios.get(`http://localhost:8000/bill-of-lading/shipment/${shipmentId}`);
      const existingBl = existingBlResponse.data;
      
      if (!existingBl) {
        alert('Original BL data not found. Please generate the original BL first.');
        return;
      }

      const generationStatus = blGenerationStatus[shipmentId];
      const consistentDate = generationStatus?.firstGenerationDate 
        ? new Date(generationStatus.firstGenerationDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      // Build BL data using the SNAPSHOT saved at first generation (do not reflect later shipment edits)
      const savedContainerNumbers3 = existingBl.containerNos
        ? String(existingBl.containerNos).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : [];
      const blDataWithCurrentContainers = {
        ...existingBl,
        containerNos: savedContainerNumbers3.join(', '),
        containers: savedContainerNumbers3.map((num: string) => ({
          containerNumber: num,
          sealNumber: '',
          grossWt: '',
          netWt: ''
        }))
      };

      const pdfData: BLFormData = {
        shipmentId: shipmentId,
        blType: blType,
        date: consistentDate,
        blNumber: `${blType.toUpperCase()}-${Date.now()}`,
        shipper: existingBl.shippersName,
        consignee: existingBl.consigneeName,
        notifyParty: existingBl.notifyPartyName,
        placeOfAcceptance: '',
        portOfLoading: '',
        portOfDischarge: '',
        placeOfDelivery: '',
        vesselVoyageNo: '',
        containerInfo: '',
        marksNumbers: '',
        descriptionOfGoods: existingBl.billofLadingDetails,
        grossWeight: existingBl.grossWt,
        netWeight: existingBl.netWt,
        shippingMarks: '',
        freightCharges: existingBl.freightAmount,
        freightPayableAt: '',
        numberOfOriginals: '',
        placeOfIssue: '',
        dateOfIssue: consistentDate,
        containers: []
      };
      
      await generateBlPdf(blType, pdfData, blDataWithCurrentContainers, 2); // 2 = 3rd copy
      
      // Mark 3rd copy as downloaded
      setBlCopyDownloadStatus(prev => ({
        ...prev,
        [shipmentId]: {
          ...prev[shipmentId],
          [blType]: {
            ...prev[shipmentId]?.[blType],
            thirdCopyDownloaded: true
          }
        }
      }));
      
    } catch (error) {
      console.error('Error generating 3rd copy PDF:', error);
      alert('Error generating 3rd copy PDF. Please try again.');
    }
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
              houseBL: '', // Add houseBL field
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
              
              // Tank preparation
              tankPreparation: '',
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-gray-300 hover:bg-gray-900/40 cursor-pointer dark:hover:bg-gray-900/40"
                            title="More options"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenCroModal(shipment)} className='cursor-pointer'>
                            Generate CRO
                          </DropdownMenuItem>
                          {/* Always show Draft BL option */}
                          <DropdownMenuItem onClick={() => handleOpenBlModal(shipment, 'draft')} className='cursor-pointer'>
                            Generate Draft BL
                          </DropdownMenuItem>
                          {/* Show Original and Seaway BL options only after draft has been generated at least once */}
                          {blGenerationStatus[shipment.id]?.hasDraftBlGenerated && (
                            <>
                              <DropdownMenuItem onClick={() => handleOpenBlModal(shipment, 'original')} className='cursor-pointer'>
                                Generate Original BL
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenBlModal(shipment, 'seaway')} className='cursor-pointer'>
                                Generate Seaway BL
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {/* Copy download options - show only for Original BL type */}
                          {/* Original BL Copy Options - only show for original BL */}
                          {blGenerationStatus[shipment.id]?.hasOriginalBLGenerated && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleDownload2ndCopyBlPdf(shipment.id, 'original')} 
                                className='cursor-pointer text-blue-600'
                              >
                                Download Original BL 2nd Copy
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDownload3rdCopyBlPdf(shipment.id, 'original')} 
                                className='cursor-pointer text-blue-600'
                              >
                                Download Original BL 3rd Copy
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* CRO Form Modal */}
      <Dialog open={showCroModal} onOpenChange={setShowCroModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Container Release Order</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Document Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date (Fixed)</Label>
                <Input
                  id="date"
                  type="date"
                  value={croFormData.date}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseBL">House BL</Label>
                <Input
                  id="houseBL"
                  value={croFormData.houseBL}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipperRefNo">Reference No.</Label>
                <Input
                  id="shipperRefNo"
                  value={croFormData.shipperRefNo}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipper">Shipper</Label>
                <Input
                  id="shipper"
                  value={croFormData.shipper}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Shipment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={croFormData.releaseDate}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pol">Port of Loading (POL)</Label>
                <Input
                  id="pol"
                  value={croFormData.pol}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pod">Port of Discharge (POD)</Label>
                <Input
                  id="pod"
                  value={croFormData.pod}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="finalDestination">Final Destination</Label>
                <Input
                  id="finalDestination"
                  value={croFormData.finalDestination}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tankPrep">Tank Preparation</Label>
              <Input
                id="tankPrep"
                value={croFormData.tankPrep}
                readOnly
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Depot Information */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Depot Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depotName">Depot Name</Label>
                  <Input
                    id="depotName"
                    value={croFormData.depotName}
                    readOnly
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depotAddress">Depot Address</Label>
                  <Input
                    id="depotAddress"
                    value={croFormData.depotAddress}
                    readOnly
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="depotContact">Depot Contact</Label>
                  <Input
                    id="depotContact"
                    value={croFormData.depotContact}
                    readOnly
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depotEmail">Depot Email</Label>
                  <Input
                    id="depotEmail"
                    value={croFormData.depotEmail}
                    readOnly
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="depotCountry">Depot Country</Label>
                  <Input
                    id="depotCountry"
                    value={croFormData.depotCountry}
                    readOnly
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depotMobile">Depot Mobile</Label>
                  <Input
                    id="depotMobile"
                    value={croFormData.depotMobile}
                    readOnly
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Container Information */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Container Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 border dark:border-neutral-700 dark:bg-neutral-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {croFormData.containers.length > 0 ? (
                    croFormData.containers.map((container: any, index: number) => (
                      <div key={index} className="bg-white rounded-md p-3 border border-gray-200 shadow-sm dark:bg-neutral-700 dark:border-neutral-600">
                        <div className="space-y-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {container.containerNumber || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-white">
                            Size: {container.containerSize || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-white">
                            Depot: {container.depotName || 'N/A'}
                          </div>
                          {container.last3Cargo && container.last3Cargo.length > 0 && (
                            <div className="text-xs text-gray-500">
                              Last Cargo: {container.last3Cargo.slice(0, 1).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-4">
                      No containers selected
                    </div>
                  )}
                </div>
                <div className="mt-3 text-sm text-gray-600 dark:text-white">
                  Total Containers: {croFormData.containers.length}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowCroModal(false)} className='cursor-pointer'>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleEditShipmentFromCro} className='cursor-pointer'>
              Edit Shipment Form
            </Button>
            <Button onClick={handleDownloadCroPdf} className='cursor-pointer'>
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BL Form Modal */}
      <Dialog open={showBlModal} onOpenChange={setShowBlModal}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto !w-[600px] !max-w-[600px] bl-modal-content" 
          style={{ 
            width: '600px !important', 
            maxWidth: '600px !important',
            minWidth: '600px',
            '--radix-dialog-content-width': '600px',
            '--radix-dialog-content-max-width': '600px'
          } as React.CSSProperties}
        >
          <DialogHeader>
            <DialogTitle>Generate {currentBlType === 'original' ? 'Original' : currentBlType === 'draft' ? 'Draft' : 'Seaway'} Bill of Lading</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Date Field - Added at the top */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blDate">Generated Date (Fixed)</Label>
                <Input
                  id="blDate"
                  type="date"
                  value={blFormData.date}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blTypeDisplay">BL Type</Label>
                <Input
                  id="blTypeDisplay"
                  value={currentBlType === 'original' ? 'Original' : currentBlType === 'draft' ? 'Draft' : 'Seaway'}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipmentIdDisplay">Shipment ID</Label>
                <Input
                  id="shipmentIdDisplay"
                  value={blFormData.shipmentId.toString()}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
            {/* Shipper Information */}
            <hr className="dark:border-black"/>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Shipper Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippersName">Shipper Name *</Label>
                  <Input
                    id="shippersName"
                    value={blFormData.shippersName}
                    onChange={(e) => setBlFormData({...blFormData, shippersName: e.target.value})}
                    placeholder="Enter shipper name"
                    className="bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippersAddress">Shipper Address</Label>
                  <Input
                    id="shippersAddress"
                    value={blFormData.shippersAddress}
                    onChange={(e) => setBlFormData({...blFormData, shippersAddress: e.target.value})}
                    placeholder="Enter shipper address"
                    className="bg-white dark:bg-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="shippersContactNo">Shipper Contact No</Label>
                  <Input
                    id="shippersContactNo"
                    value={blFormData.shippersContactNo}
                    onChange={(e) => setBlFormData({...blFormData, shippersContactNo: e.target.value})}
                    placeholder="Enter shipper contact number"
                    className="bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippersEmail">Shipper Email</Label>
                  <Input
                    id="shippersEmail"
                    value={blFormData.shippersEmail}
                    onChange={(e) => setBlFormData({...blFormData, shippersEmail: e.target.value})}
                    placeholder="Enter shipper email"
                    className="bg-white dark:bg-black"
                  />
                </div>
              </div>
            </div>

            {/* Consignee Information */}
            <hr className="border-black" />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Consignee Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consigneeName">Consignee Name *</Label>
                  <Input
                    id="consigneeName"
                    value={blFormData.consigneeName}
                    onChange={(e) => setBlFormData({...blFormData, consigneeName: e.target.value})}
                    placeholder="Enter consignee name"
                    className="bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consigneeAddress">Consignee Address</Label>
                  <Input
                    id="consigneeAddress"
                    value={blFormData.consigneeAddress}
                    onChange={(e) => setBlFormData({...blFormData, consigneeAddress: e.target.value})}
                    placeholder="Enter consignee address"
                    className="bg-white dark:bg-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="consigneeContactNo">Consignee Contact No</Label>
                  <Input
                    id="consigneeContactNo"
                    value={blFormData.consigneeContactNo}
                    onChange={(e) => setBlFormData({...blFormData, consigneeContactNo: e.target.value})}
                    placeholder="Enter consignee contact number"
                    className="bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consigneeEmail">Consignee Email</Label>
                  <Input
                    id="consigneeEmail"
                    value={blFormData.consigneeEmail}
                    onChange={(e) => setBlFormData({...blFormData, consigneeEmail: e.target.value})}
                    placeholder="Enter consignee email"
                    className="bg-white dark:bg-black"
                  />
                </div>
              </div>
            </div>

            {/* Notify Party Information */}
            <hr className="border-black" />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Notify Party Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notifyPartyName">Notify Party Name *</Label>
                  <Input
                    id="notifyPartyName"
                    value={blFormData.notifyPartyName}
                    onChange={(e) => setBlFormData({...blFormData, notifyPartyName: e.target.value})}
                    placeholder="Enter notify party name"
                    className="bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notifyPartyAddress">Notify Party Address</Label>
                  <Input
                    id="notifyPartyAddress"
                    value={blFormData.notifyPartyAddress}
                    onChange={(e) => setBlFormData({...blFormData, notifyPartyAddress: e.target.value})}
                    placeholder="Enter notify party address"
                    className="bg-white dark:bg-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="notifyPartyContactNo">Notify Party Contact No</Label>
                  <Input
                    id="notifyPartyContactNo"
                    value={blFormData.notifyPartyContactNo}
                    onChange={(e) => setBlFormData({...blFormData, notifyPartyContactNo: e.target.value})}
                    placeholder="Enter notify party contact number"
                    className="bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notifyPartyEmail">Notify Party Email</Label>
                  <Input
                    id="notifyPartyEmail"
                    value={blFormData.notifyPartyEmail}
                    onChange={(e) => setBlFormData({...blFormData, notifyPartyEmail: e.target.value})}
                    placeholder="Enter notify party email"
                    className="bg-white dark:bg-black"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Agent Information */}
            <hr className="border-black" />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Delivery Agent Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryAgentName">Delivery Agent Name *</Label>
                  <Input
                    id="deliveryAgentName"
                    value={blFormData.deliveryAgentName}
                    onChange={(e) => setBlFormData({...blFormData, deliveryAgentName: e.target.value})}
                    placeholder="Enter delivery agent name"
                    className="bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryAgentAddress">Delivery Agent Address</Label>
                  <Input
                    id="deliveryAgentAddress"
                    value={blFormData.deliveryAgentAddress}
                    onChange={(e) => setBlFormData({...blFormData, deliveryAgentAddress: e.target.value})}
                    placeholder="Enter delivery agent address"
                    className="bg-white dark:bg-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="deliveryAgentContactNo">Delivery Agent Contact No</Label>
                  <Input
                    id="deliveryAgentContactNo"
                    value={blFormData.deliveryAgentContactNo}
                    onChange={(e) => setBlFormData({...blFormData, deliveryAgentContactNo: e.target.value})}
                    placeholder="Enter delivery agent contact number"
                    className="bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryAgentEmail">Delivery Agent Email</Label>
                  <Input
                    id="deliveryAgentEmail"
                    value={blFormData.deliveryAgentEmail}
                    onChange={(e) => setBlFormData({...blFormData, deliveryAgentEmail: e.target.value})}
                    placeholder="Enter delivery agent email"
                    className="bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat">VAT</Label>
                  <Input
                    id="vat"
                    value={blFormData.Vat}
                    onChange={(e) => setBlFormData({...blFormData, Vat: e.target.value})}
                    placeholder="Enter VAT amount"
                    className="bg-white dark:bg-black"
                  />
                </div>
              </div>
            </div>

            {/* Port & Vessel Information */}
            <hr className="border-black" />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Port & Vessel Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portOfLoading">Port of Loading</Label>
                  <Input
                    id="portOfLoading"
                    value={blFormData.portOfLoading}
                    onChange={(e) => setBlFormData({...blFormData, portOfLoading: e.target.value})}
                    placeholder="Port of loading"
                    className="bg-white dark:bg-black"
                    readOnly  
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portOfDischarge">Port of Discharge</Label>
                  <Input
                    id="portOfDischarge"
                    value={blFormData.portOfDischarge}
                    onChange={(e) => setBlFormData({...blFormData, portOfDischarge: e.target.value})}
                    placeholder="Port of discharge"
                    className="bg-white dark:bg-black"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vesselNo">Vessel No</Label>
                  <Input
                    id="vesselNo"
                    value={blFormData.vesselNo}
                    onChange={(e) => setBlFormData({...blFormData, vesselNo: e.target.value})}
                    placeholder="Vessel number"
                    className="bg-white dark:bg-black"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Cargo Information */}
            <hr className="border-black" />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Cargo Information</h3>
              {/* Dynamic Container and Seal Number fields */}
              <div className="space-y-4">
                {blFormData.containers.map((container, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`containerNo_${index}`}>
                        {index === 0 ? 'Container No(s)' : `Container No ${index + 1}`}
                      </Label>
                      <Input
                        id={`containerNo_${index}`}
                        value={container.containerNumber}
                        onChange={(e) => {
                          const updatedContainers = [...blFormData.containers];
                          updatedContainers[index].containerNumber = e.target.value;
                          setBlFormData({
                            ...blFormData, 
                            containers: updatedContainers,
                            containerNos: updatedContainers.map(c => c.containerNumber).join(', ')
                          });
                        }}
                        placeholder="Container number"
                        className="bg-white dark:bg-black"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`grossWt_${index}`}>
                        {index === 0 ? 'Gross Weight *' : `Gross Wt ${index + 1} *`}
                      </Label>
                      <Input
                        id={`grossWt_${index}`}
                        value={container.grossWt || ''}
                        onChange={(e) => {
                          const updatedContainers = [...blFormData.containers];
                          updatedContainers[index].grossWt = e.target.value;
                          setBlFormData({
                            ...blFormData, 
                            containers: updatedContainers,
                            grossWt: updatedContainers.map(c => c.grossWt || '').join(', ')
                          });
                        }}
                        placeholder="Enter gross weight"
                        className="bg-white dark:bg-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`netWt_${index}`}>
                        {index === 0 ? 'Net Weight *' : `Net Wt ${index + 1} *`}
                      </Label>
                      <Input
                        id={`netWt_${index}`}
                        value={container.netWt || ''}
                        onChange={(e) => {
                          const updatedContainers = [...blFormData.containers];
                          updatedContainers[index].netWt = e.target.value;
                          setBlFormData({
                            ...blFormData, 
                            containers: updatedContainers,
                            netWt: updatedContainers.map(c => c.netWt || '').join(', ')
                          });
                        }}
                        placeholder="Enter net weight"
                        className="bg-white dark:bg-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`sealNo_${index}`}>
                        {index === 0 ? 'Seal No *' : `Seal No ${index + 1} *`}
                      </Label>
                      <Input
                        id={`sealNo_${index}`}
                        value={container.sealNumber}
                        onChange={(e) => {
                          const updatedContainers = [...blFormData.containers];
                          updatedContainers[index].sealNumber = e.target.value;
                          setBlFormData({
                            ...blFormData, 
                            containers: updatedContainers,
                            sealNo: updatedContainers.map(c => c.sealNumber || '').join(', ')
                          });
                        }}
                        placeholder="Enter seal number"
                        className="bg-white dark:bg-black"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="space-y-2 mt-4">
                  <Label htmlFor="billofLadingDetails">Bill of Lading Details</Label>
                  <Textarea
                    id="billofLadingDetails"
                    value={blFormData.billofLadingDetails}
                    onChange={(e) => setBlFormData({...blFormData, billofLadingDetails: e.target.value})}
                    placeholder="Enter bill of lading details (multiple lines supported)"
                    className="bg-white dark:bg-black min-h-[100px] resize-vertical"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Freight Information */}
            <hr className="border-black" />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Freight Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freightPayableAt">Freight Payable At</Label>
                  <Select
                    value={blFormData.freightPayableAt}
                    onValueChange={(value) => setBlFormData({...blFormData, freightPayableAt: value})}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-black">
                      <SelectValue placeholder="Select freight payable option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prepaid">Freight Prepaid</SelectItem>
                      <SelectItem value="postpaid">Freight Postpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freightAmount">Freight Amount</Label>
                  <Input
                    id="freightAmount"
                    value={blFormData.freightAmount}
                    onChange={(e) => setBlFormData({...blFormData, freightAmount: e.target.value})}
                    placeholder="Enter freight amount"
                    className="bg-white dark:bg-black"
                  />
                </div>
              </div>

              {/* Charges Section */}
               <hr className="dark:border-black mt-4"/>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Charges and Fees</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="securityDeposit">Security Deposit</Label>
                    <Input
                      id="securityDeposit"
                      value={blFormData.securityDeposit}
                      onChange={(e) => setBlFormData({...blFormData, securityDeposit: e.target.value})}
                      placeholder="Security deposit details"
                      className="bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="loloCharges">LOLO Charges</Label>
                    <Input
                      id="loloCharges"
                      value={blFormData.loloCharges}
                      onChange={(e) => setBlFormData({...blFormData, loloCharges: e.target.value})}
                      placeholder="LOLO charges"
                      className="bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Orc">ORC</Label>
                    <Input
                      id="Orc"
                      value={blFormData.Orc}
                      onChange={(e) => setBlFormData({...blFormData, Orc: e.target.value})}
                      placeholder="ORC charges"
                      className="bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspectionFees">Inspection Fees</Label>
                    <Input
                      id="inspectionFees"
                      value={blFormData.inspectionFees}
                      onChange={(e) => setBlFormData({...blFormData, inspectionFees: e.target.value})}
                      placeholder="Inspection fees"
                      className="bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reeferPlugInCharges">Reefer Plug In Charges</Label>
                    <Input
                      id="reeferPlugInCharges"
                      value={blFormData.reeferPlugInCharges}
                      onChange={(e) => setBlFormData({...blFormData, reeferPlugInCharges: e.target.value})}
                      placeholder="Reefer plug in charges"
                      className="bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialGearCharges">Special Gear Charges</Label>
                    <Input
                      id="specialGearCharges"
                      value={blFormData.specialGearCharges}
                      onChange={(e) => setBlFormData({...blFormData, specialGearCharges: e.target.value})}
                      placeholder="Special gear charges"
                      className="bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="riyadhDestinedContainerShifting">Riyadh Destined Container Shifting</Label>
                    <Input
                      id="riyadhDestinedContainerShifting"
                      value={blFormData.riyadhDestinedContainerShifting}
                      onChange={(e) => setBlFormData({...blFormData, riyadhDestinedContainerShifting: e.target.value})}
                      placeholder="Riyadh destined container shifting"
                      className="bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="xRayChargesForRiyadhShifting">X-Ray Charges For Riyadh Shifting</Label>
                    <Input
                      id="xRayChargesForRiyadhShifting"
                      value={blFormData.xRayChargesForRiyadhShifting}
                      onChange={(e) => setBlFormData({...blFormData, xRayChargesForRiyadhShifting: e.target.value})}
                      placeholder="X-Ray charges for Riyadh shifting"
                      className="bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lineDetection">Line Detection</Label>
                    <Input
                      id="lineDetection"
                      value={blFormData.lineDetection}
                      onChange={(e) => setBlFormData({...blFormData, lineDetection: e.target.value})}
                      placeholder="Line detection charges"
                      className="bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="damageRepairCleaningCharges">Damage Repair Cleaning Charges</Label>
                    <Input
                      id="damageRepairCleaningCharges"
                      value={blFormData.damageRepairCleaningCharges}
                      onChange={(e) => setBlFormData({...blFormData, damageRepairCleaningCharges: e.target.value})}
                      placeholder="Damage repair cleaning charges"
                      className="bg-white dark:bg-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowBlModal(false)} className='cursor-pointer'>
              Cancel
            </Button>
            {!blJustSaved ? (
              <Button onClick={handleSaveBlData} className='cursor-pointer'>
                Save Bill of Lading
              </Button>
            ) : (
              <>
                <Button onClick={handleSaveBlData} variant="outline" className='cursor-pointer'>
                  Update Bill of Lading
                </Button>
                <Button onClick={handleDownloadBlPdf} className='cursor-pointer bg-green-600 hover:bg-green-700'>
                  Download PDF
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllShipmentsPage;