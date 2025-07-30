'use client';

import React, { useEffect, useState } from 'react';
import { Pencil, Search, Trash2, Plus, Eye } from 'lucide-react';
import axios from 'axios';
import AddEmptyRepoModal from './EmptyRepoJobForm';
import ViewEmptyRepoJobModal from './ViewEmptyRepoJobModal';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EmptyRepo = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewEmptyRepoJob, setViewEmptyRepoJob] = useState<any>(null);
  const [emptyRepoJobs, setEmptyRepoJobs] = useState([]);
  const [searchText, setSearchText] = useState('');
  
  // ADD THIS: State for selected containers
  const [selectedContainers, setSelectedContainers] = useState<any[]>([]);

  // Initial empty form data
  const [formData, setFormData] = useState({
    id: undefined,
    date: new Date().toISOString().split('T')[0],
    jobNumber: '',
    houseBL: '',
    shippingTerm: 'CY-CY',
    portOfLoading: '',
    portOfDischarge: '',
    portOfLoadingId: undefined,
    portOfDischargeId: undefined,
    polFreeDays: '',
    polDetentionRate: '',
    podFreeDays: '',
    podDetentionRate: '',
    enableTranshipmentPort: false,
    transhipmentPortName: '',
    transhipmentPortId: undefined,
    expHandlingAgentAddressBookId: undefined,
    impHandlingAgentAddressBookId: undefined,
    quantity: '',
    carrierName: '',
    carrierId: undefined,
    vesselName: '',
    gateClosingDate: '',
    sobDate: '',
    etaToPod: '',
    emptyReturnDepot: '',
    estimatedEmptyReturnDate: '',
    containers: [],
  });

  // Fetch empty repo jobs
  const fetchEmptyRepoJobs = async () => {
    try {
      const res = await axios.get('http://localhost:8000/empty-repo-job');
      // Sort by creation date in descending order (latest first)
      const sortedData = res.data.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setEmptyRepoJobs(sortedData);
    } catch (err) {
      console.error('Failed to fetch empty repo jobs', err);
    }
  };

  useEffect(() => {
    fetchEmptyRepoJobs();
  }, []);

  // Handle delete
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this empty repo job?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/empty-repo-job/${id}`);
      await fetchEmptyRepoJobs();
    } catch (err) {
      console.error('Failed to delete empty repo job', err);
      alert('Error deleting empty repo job.');
    }
  };

  // Handle edit
  const handleEdit = async (job: any) => {
    // Fetch port information for proper port names
    let portsData = [];
    try {
      const portsRes = await fetch("http://localhost:8000/ports");
      portsData = await portsRes.json();
    } catch (err) {
      console.error("Failed to fetch ports for edit mode:", err);
    }

    // Initialize selectedContainers with the existing containers and proper port names
    const existingContainers = (job.containers || []).map((container: any) => {
      // Find the port info from the fetched ports data
      const portInfo = portsData.find((port: any) => port.id === container.portId);
      
      return {
        containerNumber: container.containerNumber || "",
        capacity: container.capacity || "",
        tare: container.tare || "",
        inventoryId: container.inventoryId || null,
        portId: container.portId || null,
        depotName: container.depotName || "",
        port: portInfo ? { id: portInfo.id, portName: portInfo.portName } : (container.port || null),
      };
    });

    setSelectedContainers(existingContainers);

    // FIX: Fetch transhipment port name if transhipmentPortId exists
    let transhipmentPortName = "";
    if (job.transhipmentPortId) {
      try {
        const res = await fetch(`http://localhost:8000/ports/${job.transhipmentPortId}`);
        const port = await res.json();
        transhipmentPortName = port.portName || "";
      } catch (err) {
        console.error("Failed to fetch transhipment port:", err);
      }
    }

    setFormData({
      id: job.id,
      date: job.date ? new Date(job.date).toISOString().split('T')[0] : '',
      jobNumber: job.jobNumber || '',
      houseBL: job.houseBL || '', // ADD THIS LINE
      shippingTerm: job.shippingTerm || 'CY-CY',
      
      // Port info
      portOfLoading: job.polPort?.portName || '',
      portOfDischarge: job.podPort?.portName || '',
      portOfLoadingId: job.polPortId,
      portOfDischargeId: job.podPortId,
      
      // Free days and detention
      polFreeDays: job.polFreeDays || '',
      polDetentionRate: job.polDetentionRate || '',
      podFreeDays: job.podFreeDays || '',
      podDetentionRate: job.podDetentionRate || '',
      
      // FIX: Transhipment - properly set both the flag and the port name
      enableTranshipmentPort: !!job.transhipmentPortId,
      transhipmentPortName: transhipmentPortName, // Use the fetched port name
      transhipmentPortId: job.transhipmentPortId, // Keep the ID for submission
      
      // Agents
      expHandlingAgentAddressBookId: job.expHandlingAgentAddressBookId,
      impHandlingAgentAddressBookId: job.impHandlingAgentAddressBookId,
      
      // Container info
      quantity: job.quantity || '',
      containers: existingContainers,
      
      // Vessel details
      carrierName: job.carrierAddressBook?.companyName || '',
      carrierId: job.carrierAddressBookId,
      vesselName: job.vesselName || '',
      gateClosingDate: job.gsDate ? new Date(job.gsDate).toISOString().split('T')[0] : '',
      sobDate: job.sob ? new Date(job.sob).toISOString().split('T')[0] : '',
      etaToPod: job.etaTopod ? new Date(job.etaTopod).toISOString().split('T')[0] : '',
      
      // Return depot
      emptyReturnDepot: job.emptyReturnDepotAddressBookId?.toString() || '',
      estimatedEmptyReturnDate: job.estimateDate ? new Date(job.estimateDate).toISOString().split('T')[0] : '',
    });
    
    setShowModal(true);
  };

  // Handle view empty repo job
  const handleView = (job: any) => {
    setViewEmptyRepoJob(job);
    setShowViewModal(true);
  };

  // Filter jobs based on search
  const filteredJobs = emptyRepoJobs.filter((job: any) => {
    const searchLower = searchText.toLowerCase();
    return (
      job.jobNumber?.toLowerCase().includes(searchLower) ||
      job.houseBL?.toLowerCase().includes(searchLower) ||
      job.polPort?.portName?.toLowerCase().includes(searchLower) ||
      job.podPort?.portName?.toLowerCase().includes(searchLower)
    );
  });

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
              placeholder="Search by job number, house BL, or ports..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white placeholder:text-neutral-400 focus-visible:ring-neutral-700"
            />
          </div>
        </div>

        <Button
          onClick={() => {
            // FIX: Reset selectedContainers when creating new job
            setSelectedContainers([]);
            
            setFormData({
              id: undefined,
              date: new Date().toISOString().split('T')[0],
              jobNumber: '',
              houseBL: '',
              shippingTerm: 'CY-CY',
              portOfLoading: '',
              portOfDischarge: '',
              portOfLoadingId: undefined,
              portOfDischargeId: undefined,
              polFreeDays: '',
              polDetentionRate: '',
              podFreeDays: '',
              podDetentionRate: '',
              enableTranshipmentPort: false,
              transhipmentPortName: '',
              transhipmentPortId: undefined,
              expHandlingAgentAddressBookId: undefined,
              impHandlingAgentAddressBookId: undefined,
              quantity: '',
              carrierName: '',
              carrierId: undefined,
              vesselName: '',
              gateClosingDate: '',
              sobDate: '',
              etaToPod: '',
              emptyReturnDepot: '',
              estimatedEmptyReturnDate: '',
              containers: [],
            });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Empty Repo Job
        </Button>

        {showModal && (
          <AddEmptyRepoModal
            onClose={() => setShowModal(false)}
            formTitle={formData.id ? 'Edit Empty Repo Job' : 'New Empty Repo Job'}
            form={formData}
            setForm={setFormData}
            selectedContainers={selectedContainers} // ADD THIS
            setSelectedContainers={setSelectedContainers} // ADD THIS
            refreshShipments={fetchEmptyRepoJobs}
          />
        )}

        {/* View Modal */}
        {showViewModal && viewEmptyRepoJob && (
          <ViewEmptyRepoJobModal
            emptyRepoJob={viewEmptyRepoJob}
            onClose={() => {
              setShowViewModal(false);
            }}
            onDownload={() => {
              // You can implement download functionality here if needed
              console.log('Download functionality not implemented yet');
            }}
            onEdit={() => {
              // Close view modal first
              setShowViewModal(false);
              
              // Then trigger edit with a slight delay
              setTimeout(() => {
                handleEdit(viewEmptyRepoJob);
              }, 100);
            }}
          />
        )}
      </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-x-auto shadow-sm">
        <Table>
          <TableHeader className="bg-white dark:bg-neutral-900">
            <TableRow>
              <TableHead className="px-2 py-2 whitespace-nowrap text-black dark:text-neutral-200 font-medium">Job Number</TableHead>
              <TableHead className="px-2 py-2 whitespace-nowrap text-black dark:text-neutral-200 font-medium">House BL</TableHead>
              <TableHead className="px-2 py-2 whitespace-nowrap text-black dark:text-neutral-200 font-medium">Port of Loading</TableHead>
              <TableHead className="px-2 py-2 whitespace-nowrap text-black dark:text-neutral-200 font-medium">Port of Discharge</TableHead>
              <TableHead className="px-2 py-2 whitespace-nowrap text-black dark:text-neutral-200 font-medium">Vessel</TableHead>
              <TableHead className="px-2 py-2 whitespace-nowrap text-black dark:text-neutral-200 font-medium">ETD</TableHead>
              <TableHead className="px-2 py-2 whitespace-nowrap text-black dark:text-neutral-200 font-medium">Containers</TableHead>
              <TableHead className="px-2 py-2 whitespace-nowrap text-black dark:text-neutral-200 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-neutral-400 py-6">
                  No empty repo jobs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job: any) => (
                <TableRow
                  key={job.id}
                  className="text-black dark:text-white border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <TableCell className="font-medium">{job.jobNumber}</TableCell>
                  <TableCell>{job.houseBL || '-'}</TableCell>
                  <TableCell>{job.polPort?.portName || '-'}</TableCell>
                  <TableCell>{job.podPort?.portName || '-'}</TableCell>
                  <TableCell>{job.vesselName || '-'}</TableCell>
                  <TableCell>{job.sob ? new Date(job.sob).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    {(job.containers ?? [])
                      .map((c: any) => c.containerNumber)
                      .join(', ') || '-'}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      onClick={() => handleView(job)}
                      title="View Details"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-900/40 cursor-pointer dark:hover:bg-purple-900/40"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      onClick={() => handleEdit(job)}
                      title="Edit"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 cursor-pointer dark:hover:bg-blue-900/40"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(job.id)}
                      title="Delete"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/40 cursor-pointer dark:hover:bg-red-900/40"
                    >
                      <Trash2 size={16} />
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

export default EmptyRepo;