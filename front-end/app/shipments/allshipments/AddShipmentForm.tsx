"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Plus, AlertTriangle, X } from "lucide-react";

type Option = { id: string | number; name: string };
type ProductOption = {
  id: number;
  productId: string;
  productName: string;
  productType: string;
};

type SelectOptions = {
  customer: Option[];
  product: ProductOption[];
  port: Option[];
  agent: Option[];
  depot: Option[];
  shippingTerm: Option[];
};

const ContainerSearchModal = ({
  open,
  onClose,
  countries,
  ports,
  containers,
  selectedCountry,
  setSelectedCountry,
  selectedPort,
  setSelectedPort,
  onHireDepots,
  selectedOnHireDepot,
  setSelectedOnHireDepot,
  modalSelectedContainers,
  setModalSelectedContainers,
  setShowContainerModal, // <-- Add this prop
  setSelectedContainers, // <-- Add this prop for container selection
  form, // <-- Add form prop
  selectedContainers, // <-- Add selectedContainers prop
}: any) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent 
      className="!w-[90vw] !max-w-[600px] min-w-0 bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-0 border border-neutral-200 dark:border-neutral-800"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Select Containers
        </DialogTitle>
      </DialogHeader>
      <div className="px-6 py-4 space-y-4">
        {/* Country, Port, On Hire Depot Selection */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
          <div>
            <Label htmlFor="country" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
              Country
            </Label>
            <Select
              value={selectedCountry}
              onValueChange={(value) => setSelectedCountry(value)}
            >
              <SelectTrigger className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700">
                {countries.map((country: any) => (
                  <SelectItem key={country.id} value={country.id.toString()} className="text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer">
                    {country.countryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="port" className="block text-sm text-gray-900 dark:text-neutral-200 mb-1">
              Tank Collection Port
            </Label>
            <Select
              value={selectedPort}
              onValueChange={(value) => {
                setSelectedPort(value);
                setSelectedOnHireDepot(""); // Reset depot when port changes
              }}
              disabled={!selectedCountry}
            >
              <SelectTrigger className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                <SelectValue placeholder="Select Port" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700">
                {ports.map((port: any) => (
                  <SelectItem key={port.id} value={port.id.toString()} className="text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer">
                    {port.portName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1 h-5">
              <Label htmlFor="onHireDepot" className="block text-sm text-gray-900 dark:text-neutral-200">
                Location
              </Label>
              <div className="h-5 flex items-center -mt-1">
                {selectedOnHireDepot && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedOnHireDepot("")}
                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white border-red-600 cursor-pointer md:h-7"
                  >
                    Deselect
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Select
                value={selectedOnHireDepot}
                onValueChange={(value) => setSelectedOnHireDepot(value)}
                disabled={!selectedPort || onHireDepots.length === 0}
              >
              <SelectTrigger className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700">
                {onHireDepots.map((depot: any) => (
                  <SelectItem key={depot.id} value={depot.id.toString()} className="text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer">
                    {depot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          </div>
        </div>

        {/* Container List and Actions */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <Label
                htmlFor="containers"
                className="block text-sm text-gray-900 dark:text-neutral-200"
              >
                Containers
              </Label>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                {modalSelectedContainers.length} selected
              </span>
            </div>
            {containers.length > 0 && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setModalSelectedContainers([...containers])}
                  className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setModalSelectedContainers([])}
                  className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  Deselect All
                </Button>
              </div>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto border rounded p-2 bg-white dark:bg-neutral-900">
            {containers.length === 0 && (
              <div className="text-center text-neutral-400 py-4">
                No containers available for the selected port.
              </div>
            )}
            {containers.map((container: any) => (
              <div
                key={container.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                onClick={() => {
                  if (
                    modalSelectedContainers.some(
                      (c: any) => c.id === container.id
                    )
                  ) {
                    setModalSelectedContainers((prev: any[]) =>
                      prev.filter((c: any) => c.id !== container.id)
                    );
                  } else {
                    setModalSelectedContainers((prev: any[]) => [
                      ...prev,
                      container,
                    ]);
                  }
                }}
              >
                <div className="flex items-center">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={modalSelectedContainers.some(
                        (c: any) => c.id === container.id
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setModalSelectedContainers((prev: any[]) => [
                            ...prev,
                            container,
                          ]);
                        } else {
                          setModalSelectedContainers((prev: any[]) =>
                            prev.filter((c: any) => c.id !== container.id)
                          );
                        }
                      }}
                      className="mr-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white text-sm">
                      {container.inventory?.containerNumber || "N/A"}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {container.status || "UNKNOWN"}
                    </span>
                  </div>
                </div>
                <div className="text-gray-700 dark:text-neutral-300 text-xs">
                  {container.port?.portName || "N/A"} -{" "}
                  {container.depotName || container.addressBook?.companyName || "N/A"}
                  <div className="mt-1">
                    Capacity: {container.inventory?.containerCapacity || "N/A"} | 
                    Unit: {container.inventory?.capacityUnit || "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setSelectedCountry("");
            setSelectedPort("");
            setSelectedOnHireDepot("");
            setModalSelectedContainers([]);
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-800 text-white border border-neutral-300 cursor-pointer"
        >
          Reset
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Reset all modal state when cancelling
            setSelectedCountry("");
            setSelectedPort("");
            setSelectedOnHireDepot("");
            setModalSelectedContainers([]);
            setShowContainerModal(false);
          }}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            // Check quantity limit before adding containers
            const currentQuantity = parseInt(form.quantity);
            if (!form.quantity || isNaN(currentQuantity) || currentQuantity <= 0) {
              alert("Please enter a valid positive number in the quantity field first.");
              return;
            }
            const totalAfterAdding = selectedContainers.length + modalSelectedContainers.length;
            if (totalAfterAdding > currentQuantity) {
              alert(`Cannot add ${modalSelectedContainers.length} containers. You have set the quantity to ${currentQuantity}. Please update the quantity field or select fewer containers.`);
              return;
            }

            // Map modalSelectedContainers to the same structure as handleSuggestionSelect
            const mapped = modalSelectedContainers.map((item: any) => ({
              containerNumber: item.inventory?.containerNumber,
              capacity: item.inventory?.containerCapacity,
              tare: item.inventory?.tareWeight,
              inventoryId: item.inventory?.id,
              portId: item.port?.id || null,
              port: item.port || null,
              depotName: item.depotName || item.addressBook?.companyName || "",
              inventory: item.inventory,
            }));

            setSelectedContainers((prev: any[]) => {
              // Deduplicate by containerNumber
              const all = [...prev, ...mapped];
              const unique = all.filter(
                (c, idx, arr) =>
                  arr.findIndex(
                    (x) =>
                      (x.containerNumber || x.inventory?.containerNumber) ===
                      (c.containerNumber || c.inventory?.containerNumber)
                  ) === idx
              );
              return unique;
            });

            setShowContainerModal(false);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer"
          disabled={modalSelectedContainers.length === 0}
        >
          Add Selected Containers
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const AddShipmentModal = ({
  onClose,
  formTitle,
  form,
  setForm,
  selectedContainers,
  setSelectedContainers,
  refreshShipments,
}: any) => {
  const [consigneeSuggestions, setConsigneeSuggestions] = useState<any[]>([]);
  const [carrierSuggestions, setCarrierSuggestions] = useState<any[]>([]);
  const [shipperSuggestions, setShipperSuggestions] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allMovements, setAllMovements] = useState<any[]>([]);
  const [allInventories, setAllInventories] = useState<any[]>([]);

  // Add state for showing the container modal
  const [showContainerModal, setShowContainerModal] = useState(false);
  const [modalSelectedContainers, setModalSelectedContainers] = useState<any[]>(
    []
  );
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [countries, setCountries] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);

  // Add validation error state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);



  // Add new suggestion states for the converted fields
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [portSuggestions, setPortSuggestions] = useState<any[]>([]);
  const [agentSuggestions, setAgentSuggestions] = useState<any[]>([]);
  const [depotSuggestions, setDepotSuggestions] = useState<any[]>([]);
  const [quotationSuggestions, setQuotationSuggestions] = useState<any[]>([]);

  // FIX 1: Create separate state for each dropdown visibility
  const [showSuggestions, setShowSuggestions] = useState({
    customer: false,
    product: false,
    portLoading: false,
    portDischarge: false,
    expAgent: false,
    impAgent: false,
    depot: false,
    consignee: false,
    shipper: false,
    carrier: false,
    quotation: false,
  });

  // Add new state for filtered options
  const [expAgents, setExpAgents] = useState<
    { id: number; companyName: string }[]
  >([]);
  const [impHandlingAgents, setImpHandlingAgents] = useState<
    { id: number; companyName: string }[]
  >([]);
  const [emptyReturnDepots, setEmptyReturnDepots] = useState<
    { id: number; companyName: string; businessType?: string }[]
  >([]);
  const [onHireDepots, setOnHireDepots] = useState<any[]>([]);
  const [selectedOnHireDepot, setSelectedOnHireDepot] = useState<string>("");

  // Helper function to update specific dropdown visibility
  const toggleSuggestions = (field: string, visible: boolean) => {
    setShowSuggestions((prev) => ({
      ...prev,
      [field]: visible,
    }));
  };

  // Function to fetch EXP handling agents by port
  const fetchExpHandlingAgentsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://localhost:8000/addressbook");
      const data = await res.json();

      const filtered = data.filter((entry: any) => {
        const isHandlingAgent = entry.businessType
          ?.toLowerCase()
          .includes("handling agent");

        const linkedToPort = entry.businessPorts?.some(
          (bp: any) => bp.portId === portId
        );

        return isHandlingAgent && linkedToPort;
      });

      setExpAgents(filtered);
    } catch (err) {
      console.error("Failed to fetch export handling agents:", err);
      setExpAgents([]); // Set empty array on error
    }
  };

  // Function to fetch IMP handling agents by port
  const fetchImpHandlingAgentsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://localhost:8000/addressbook");
      const data = await res.json();

      const filtered = data.filter((entry: any) => {
        const isHandlingAgent = entry.businessType
          ?.toLowerCase()
          .includes("handling agent");

        const linkedToPort = entry.businessPorts?.some(
          (bp: any) => bp.portId === portId
        );

        return isHandlingAgent && linkedToPort;
      });

      setImpHandlingAgents(filtered);
    } catch (err) {
      console.error("Failed to fetch import handling agents:", err);
      setImpHandlingAgents([]); // Set empty array on error
    }
  };

  // Function to fetch empty return depots by port
  const fetchEmptyReturnDepotsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://localhost:8000/addressbook");
      const data = await res.json();

      const filtered = data.filter((entry: any) => {
        const businessType = (entry.businessType || "").toLowerCase();

        const isDepotOrCY =
          businessType.includes("deport terminal") ||
          businessType.includes("cy terminal");

        const linkedToPort =
          Array.isArray(entry.businessPorts) &&
          entry.businessPorts.some((bp: any) => bp.portId === portId);

        return isDepotOrCY && linkedToPort;
      });

      setEmptyReturnDepots(filtered);
    } catch (err) {
      console.error("Failed to fetch empty return depots:", err);
      setEmptyReturnDepots([]); // Set empty array on error
    }
  };

  // --- Fetch On Hire Depots when port changes ---
  useEffect(() => {
    if (selectedPort) {
      fetch("http://localhost:8000/leasinginfo")
        .then((res) => res.json())
        .then((data) => {
          // Filter leasing info by port and get unique depots
          const portLeasingInfo = data.filter((lease: any) => 
            lease.portId?.toString() === selectedPort
          );
          
          // Get unique depot names and IDs
          const uniqueDepots = portLeasingInfo.reduce((acc: any[], lease: any) => {
            if (lease.onHireDepotAddressBook && 
                !acc.find(depot => depot.id === lease.onHireDepotAddressBook.id)) {
              acc.push({
                id: lease.onHireDepotAddressBook.id,
                name: lease.onHireDepotAddressBook.companyName,
              });
            }
            return acc;
          }, []);
          
          setOnHireDepots(uniqueDepots);
        })
        .catch((err) => {
          console.error("Failed to fetch onhire depots:", err);
          setOnHireDepots([]);
        });
    } else {
      setOnHireDepots([]);
      setSelectedOnHireDepot("");
    }
  }, [selectedPort]);



  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const customers = data.filter((entry: any) =>
          entry.businessType?.includes("Customer")
        );
        setCustomerSuggestions(customers);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8000/products");
        const data = await res.json();
        setProductSuggestions(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const res = await fetch("http://localhost:8000/ports");
        const data = await res.json();
        setPortSuggestions(data);
      } catch (err) {
        console.error("Error fetching ports:", err);
      }
    };

    fetchPorts();
  }, []);

  // Fetch countries on mount
  useEffect(() => {
    fetch("http://localhost:8000/country")
      .then((res) => res.json())
      .then(setCountries);
  }, []);

  // Fetch ports when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetch("http://localhost:8000/ports")
        .then((res) => res.json())
        .then((data) => {
          setPorts(
            data.filter((p: any) => p.countryId?.toString() === selectedCountry)
          );
        });
    } else {
      setPorts([]);
    }
    setSelectedPort("");
    setContainers([]);
  }, [selectedCountry]);

  // Fetch containers when port or onhire depot changes
  useEffect(() => {
    if (selectedPort) {
      fetch("http://localhost:8000/inventory")
        .then((res) => res.json())
        .then((inventoryData) => {
          // Filter inventory by port using leasingInfo
          let filteredInventory = inventoryData.filter((inv: any) => {
            if (!inv.leasingInfo || inv.leasingInfo.length === 0) return false;
            
            // Check if any leasing info has the selected port
            return inv.leasingInfo.some((lease: any) => 
              lease.portId?.toString() === selectedPort
            );
          });

          // If onhire depot is selected, further filter by depot using leasingInfo
          if (selectedOnHireDepot) {
            filteredInventory = filteredInventory.filter((inv: any) => {
              return inv.leasingInfo.some((lease: any) => 
                lease.portId?.toString() === selectedPort &&
                lease.onHireDepotaddressbookId?.toString() === selectedOnHireDepot
              );
            });
          }

          // Fetch ports and address book to get proper port names and depot names
          return Promise.all([
            fetch("http://localhost:8000/movement-history/latest").then(res => res.json()),
            fetch("http://localhost:8000/ports").then(res => res.json()),
            fetch("http://localhost:8000/addressbook").then(res => res.json())
          ]).then(([movementData, portsData, addressBookData]) => {
            // Create a map of latest movement status by inventory ID
            const latestMovements = movementData.reduce((acc: any, movement: any) => {
              if (movement.inventoryId) {
                acc[movement.inventoryId] = movement;
              }
              return acc;
            }, {});

            // Create a map of ports by ID
            const portsMap = portsData.reduce((acc: any, port: any) => {
              acc[port.id] = port;
              return acc;
            }, {});

            // Create a map of address book (depots) by ID
            const addressBookMap = addressBookData.reduce((acc: any, entry: any) => {
              acc[entry.id] = entry;
              return acc;
            }, {});

              // Filter to only show available containers
              const availableContainers = filteredInventory
                .filter((inv: any) => {
                  const latestMovement = latestMovements[inv.id];
                  return latestMovement && latestMovement.status === "AVAILABLE";
                })
                .map((inv: any) => {
                  // Get the relevant leasing info for the selected port
                  const relevantLease = inv.leasingInfo.find((lease: any) => {
                    if (selectedOnHireDepot) {
                      return lease.portId?.toString() === selectedPort &&
                             lease.onHireDepotaddressbookId?.toString() === selectedOnHireDepot;
                    }
                    return lease.portId?.toString() === selectedPort;
                  });

                  const latestMovement = latestMovements[inv.id];
                  const portInfo = portsMap[relevantLease?.portId] || {};
                  const depotInfo = addressBookMap[relevantLease?.onHireDepotaddressbookId] || {};

                  return {
                    id: inv.id,
                    inventory: inv,
                    inventoryId: inv.id,
                    depotName: depotInfo.companyName || relevantLease?.onHireDepotAddressBook?.companyName || "",
                    port: { id: relevantLease?.portId, portName: portInfo.portName || "Unknown Port" },
                    addressBook: depotInfo || relevantLease?.onHireDepotAddressBook || null,
                    status: latestMovement?.status || "UNKNOWN",
                  };
                });

              setContainers(availableContainers);
            });
        })
        .catch((err) => {
          console.error("Failed to fetch containers:", err);
          setContainers([]);
        });
    } else {
      setContainers([]);
    }
    setModalSelectedContainers([]);
  }, [selectedPort, selectedOnHireDepot]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const agents = data.filter(
          (entry: any) =>
            entry.businessType?.includes("Handling Agent") ||
            entry.businessType?.includes("Agent")
        );
        setAgentSuggestions(agents);
      } catch (err) {
        console.error("Error fetching agents:", err);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchDepots = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const depots = data.filter(
          (entry: any) =>
            entry.businessType?.includes("Depot") ||
            entry.businessType?.includes("Empty Return") ||
            entry.businessType?.includes("Deport Terminal")
        );
        setDepotSuggestions(depots);
      } catch (err) {
        console.error("Error fetching depots:", err);
      }
    };

    fetchDepots();
  }, []);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await fetch("http://localhost:8000/quotations");
        const data = await res.json();
        // Ensure data is an array
        setQuotationSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching quotations:", err);
        setQuotationSuggestions([]); // Set empty array on error
      }
    };

    fetchQuotations();
  }, []);

  // Helper function to auto-select country and port in container modal
  const autoSelectPortInModal = () => {
    if (form.portOfLoading && portSuggestions.length > 0) {
      const selectedPortObj = portSuggestions.find(
        (port: any) => port.id.toString() === form.portOfLoading.toString()
      );
      if (selectedPortObj) {
        // Set the country - port will be set by the useEffect watching ports array
        setSelectedCountry(selectedPortObj.countryId?.toString() || "");
      }
    }
  };

  // Auto-select country and port in container modal when port of loading changes
  useEffect(() => {
    autoSelectPortInModal();
  }, [form.portOfLoading]);

  // Auto-select when port suggestions are loaded (in case port was set before suggestions loaded)
  useEffect(() => {
    autoSelectPortInModal();
  }, [portSuggestions]);

  // Also auto-select when countries are loaded (in case they weren't available before)
  useEffect(() => {
    autoSelectPortInModal();
  }, [countries]);

  // Auto-select port when the modal's filtered ports are loaded for the selected country
  useEffect(() => {
    if (form.portOfLoading && ports.length > 0 && selectedCountry) {
      const portInFilteredList = ports.find(
        (port: any) => port.id.toString() === form.portOfLoading.toString()
      );
      if (portInFilteredList && selectedPort !== form.portOfLoading.toString()) {
        setSelectedPort(form.portOfLoading.toString());
      }
    }
  }, [ports, selectedCountry, form.portOfLoading]);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await axios.get("http://localhost:8000/movement-history");

        // Group by containerNumber inside inventory
        const grouped: { [key: string]: any[] } = {};
        for (const m of res.data) {
          const containerNo = m.inventory?.containerNumber;
          if (!containerNo) continue;

          if (!grouped[containerNo]) grouped[containerNo] = [];
          grouped[containerNo].push(m);
        }

        // Get latest entry per container, filter AVAILABLE ones
        const latestAvailableOnly = Object.values(grouped)
          .map(
            (group: any[]) =>
              group.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0]
          )
          .filter((m) => m.status === "AVAILABLE");

        setAllMovements(latestAvailableOnly);
      } catch (err) {
        console.error("Failed to fetch movements", err);
      }
    };

    fetchMovements();
  }, []);

  const handleContainerSearch = (value: string) => {
    setForm({ ...form, containerNumber: value });

    // Check if quantity is set and is a valid positive number before allowing search
    const currentQuantity = parseInt(form.quantity);
    if (!form.quantity || isNaN(currentQuantity) || currentQuantity <= 0) {
      setSuggestions([]);
      return;
    }

    if (value.length >= 2) {
      const matched = allMovements
        .filter(
          (m) =>
            m.inventory?.containerNumber &&
            m.inventory.containerNumber
              .toLowerCase()
              .includes(value.toLowerCase())
        )
        .sort(
          (a, b) =>
            new Date(a.inventory?.createdAt || a.createdAt).getTime() -
            new Date(b.inventory?.createdAt || b.createdAt).getTime()
        ); // FIFO: oldest first

      setSuggestions(matched);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (item: any) => {
    const containerNo = item.inventory?.containerNumber;
    if (selectedContainers.some((c: any) => c.containerNumber === containerNo))
      return;

    // Check quantity limit before adding container
    const currentQuantity = parseInt(form.quantity);
    if (!form.quantity || isNaN(currentQuantity) || currentQuantity <= 0) {
      alert("Please enter a valid positive number in the quantity field first.");
      return;
    }
    if (selectedContainers.length >= currentQuantity) {
      alert(`Cannot add more containers. You have set the quantity to ${currentQuantity}. Please update the quantity field if you need to add more containers.`);
      return;
    }

    const newContainer = {
      containerNumber: containerNo,
      capacity: item.inventory?.containerCapacity,
      tare: item.inventory?.tareWeight,
      inventoryId: item.inventory?.id,
      portId: item.port?.id || null,
      port: item.port || null,
      depotName: item.addressBook?.companyName || "",
    };

    const updatedContainers = [...selectedContainers, newContainer];
    setSelectedContainers(updatedContainers);

    setForm({
      ...form,
      containers: updatedContainers.map((c) => ({
        containerNumber: c.containerNumber,
        capacity: c.capacity,
        tare: c.tare,
        inventoryId: c.inventoryId,
        portId: c.portId,
        depotName: c.depotName,
      })),
      containerNumber: "",
      capacity: "",
      tare: "",
      portName: "",
      depotName: "",
    });
    setSuggestions([]);
  };

  const handleRemoveContainer = (index: number) => {
    const updated = [...selectedContainers];
    updated.splice(index, 1);
    setSelectedContainers(updated);
  };

  const [selectOptions, setSelectOptions] = useState<SelectOptions>({
    customer: [],
    product: [],
    port: [],
    agent: [],
    depot: [],
    shippingTerm: [],
  });

  // Effect to populate select options and form data when editing
  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        // Fetch all options in parallel
        const [addressBookRes, productsRes, portsRes] = await Promise.all([
          fetch("http://localhost:8000/addressbook"),
          fetch("http://localhost:8000/products"),
          fetch("http://localhost:8000/ports"),
        ]);

        const [addressBookData, productsData, portsData] = await Promise.all([
          addressBookRes.json(),
          productsRes.json(),
          portsRes.json(),
        ]);

        // Process customer options
        const customers = addressBookData
          .filter((entry: any) => entry.businessType?.includes("Customer"))
          .map((entry: any) => ({ id: entry.id, name: entry.companyName }));

        // Process product options
        const products = productsData.map((product: any) => ({
          id: product.id,
          productId: product.productId,
          productName: product.productName,
          productType: product.productType || "",
        }));

        // Process port options
        const ports = portsData.map((port: any) => ({
          id: port.id,
          name: port.portName,
        }));

        // Process agent options
        const agents = addressBookData
          .filter(
            (entry: any) =>
              entry.businessType?.includes("Handling Agent") ||
              entry.businessType?.includes("Agent")
          )
          .map((entry: any) => ({ id: entry.id, name: entry.companyName }));

        // Process depot options
        const depots = addressBookData
          .filter(
            (entry: any) =>
              entry.businessType?.includes("Depot") ||
              entry.businessType?.includes("Empty Return") ||
              entry.businessType?.includes("Deport Terminal")
          )
          .map((entry: any) => ({ id: entry.id, name: entry.companyName }));

        // Define shipping terms
        let shippingTerms = [
          { id: "CY-CY", name: "CY-CY" },
          { id: "CY-Door", name: "CY-Door" },
          { id: "Door-CY", name: "Door-CY" },
          { id: "Door-Door", name: "Door-Door" },
          { id: "CY-CFS", name: "CY-CFS" },
          { id: "CFS-CY", name: "CFS-CY" },
          { id: "CFS-CFS", name: "CFS-CFS" },
          { id: "Door-CFS", name: "Door-CFS" },
          { id: "CFS-Door", name: "CFS-Door" },
        ];

        if (
          form.id &&
          form.shippingTerm &&
          !shippingTerms.find((t) => t.id === form.shippingTerm)
        ) {
          shippingTerms.push({
            id: form.shippingTerm,
            name: form.shippingTerm,
          });
        }

        setSelectOptions({
          customer: customers,
          product: products,
          port: ports,
          agent: agents,
          depot: depots,
          shippingTerm: shippingTerms,
        });

        // FIX: If this is an edit operation, populate display names for all searchable fields
        if (form.id) {
          // Find and set customer display name
          const selectedCustomer = customers.find(
            (c: any) => c.id.toString() === form.customerName?.toString()
          );
          if (selectedCustomer) {
            setForm((prev: any) => ({
              ...prev,
              customerDisplayName: selectedCustomer.name,
            }));
          }

          // Find and set product display name
          const selectedProduct = products.find(
            (p: any) => p.id.toString() === form.productId?.toString()
          );
          if (selectedProduct) {
            setForm((prev: any) => ({
              ...prev,
              productDisplayName: `${selectedProduct.productId} - ${selectedProduct.productName} - ${selectedProduct.productType}`,
            }));
          }

          // Find and set port display names
          const selectedPolPort = ports.find(
            (p: any) => p.id.toString() === form.portOfLoading?.toString()
          );
          if (selectedPolPort) {
            setForm((prev: any) => ({
              ...prev,
              portOfLoadingName: selectedPolPort.name,
            }));
          }

          const selectedPodPort = ports.find(
            (p: any) => p.id.toString() === form.portOfDischarge?.toString()
          );
          if (selectedPodPort) {
            setForm((prev: any) => ({
              ...prev,
              portOfDischargeName: selectedPodPort.name,
            }));
          }

          // FIX: Fetch filtered data immediately after setting port names
          const fetchPromises = [];

          if (form.portOfLoading) {
            fetchPromises.push(
              fetchExpHandlingAgentsByPort(Number(form.portOfLoading))
            );
          }

          if (form.portOfDischarge) {
            fetchPromises.push(
              fetchImpHandlingAgentsByPort(Number(form.portOfDischarge))
            );
            fetchPromises.push(
              fetchEmptyReturnDepotsByPort(Number(form.portOfDischarge))
            );
          }

          // Wait for all filtered data to be fetched
          await Promise.all(fetchPromises);

          // Fetch and set other display names (existing code)
          if (form.consigneeId || form.consigneeAddressBookId) {
            try {
              const consigneeId =
                form.consigneeAddressBookId || form.consigneeId;
              const consigneeRes = await fetch(
                `http://localhost:8000/addressbook/${consigneeId}`
              );
              const consigneeData = await consigneeRes.json();
              setForm((prev: any) => ({
                ...prev,
                consigneeName: consigneeData.companyName,
              }));
            } catch (err) {
              console.error("Failed to fetch consignee data", err);
            }
          }

          if (form.shipperId || form.shipperAddressBookId) {
            try {
              const shipperId = form.shipperAddressBookId || form.shipperId;
              const shipperRes = await fetch(
                `http://localhost:8000/addressbook/${shipperId}`
              );
              const shipperData = await shipperRes.json();
              setForm((prev: any) => ({
                ...prev,
                shipperName: shipperData.companyName,
              }));
            } catch (err) {
              console.error("Failed to fetch shipper data", err);
            }
          }

          if (form.carrierId || form.carrierAddressBookId) {
            try {
              const carrierId = form.carrierAddressBookId || form.carrierId;
              const carrierRes = await fetch(
                `http://localhost:8000/addressbook/${carrierId}`
              );
              const carrierData = await carrierRes.json();
              setForm((prev: any) => ({
                ...prev,
                carrierName: carrierData.companyName,
              }));
            } catch (err) {
              console.error("Failed to fetch carrier data", err);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching select options:", error);
      }
    };

    fetchSelectOptions();
  }, [form.id]); // Re-run when form.id changes (edit vs new)

  // Effect to handle selectedContainers when in edit mode
  // Note: selectedContainers are managed by the parent ShipmentTable component
  // and passed down as props, so no additional handling needed here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Clear previous validation errors
      setValidationErrors({});

      // Validate required fields ONLY for new shipments (not for edits)
      if (!form.id) {
        const requiredFields = [
          "date",
          "jobNumber",
          "shippingTerm",
          "customerName",
          "productName",
          "portOfLoading",
          "portOfDischarge",
          "expHandlingAgent",
          "impHandlingAgent",
          "emptyReturnDepot",
          "vesselName",
          "quantity",
        ];

        const errors: {[key: string]: string} = {};
        
        for (const field of requiredFields) {
          if (!form[field]) {
            errors[field] = "Please fill this field";
          }
        }

        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          setShowValidationAlert(true);
          // Auto-hide alert after 2 seconds
          setTimeout(() => {
            setShowValidationAlert(false);
          }, 2000);
          return;
        }
      }

      // Validate quantity matches exactly with selected containers
      const currentQuantity = parseInt(form.quantity);
      if (!form.quantity || isNaN(currentQuantity) || currentQuantity <= 0) {
        alert("Please enter a valid positive number in the quantity field.");
        return;
      }
      if (selectedContainers.length !== currentQuantity) {
        alert(
          `Quantity mismatch: You have set quantity to ${currentQuantity} but selected ${selectedContainers.length} containers. Please ensure the number of selected containers exactly matches the quantity.`
        );
        return;
      }

      // Build payload with only the fields that have values
      const payload: any = {};

      // Basic fields - FIX: Make quotation reference number optional
      if (form.quotationRefNo && form.quotationRefNo.trim() !== "") {
        payload.quotationRefNumber = form.quotationRefNo;
      }

      if (form.date) payload.date = new Date(form.date).toISOString();
      if (form.jobNumber) payload.jobNumber = form.jobNumber;
      payload.refNumber = form.referenceNumber || ""; // Always include refNumber, even if empty
      payload.masterBL = form.masterBL || ""; // Always include masterBL, even if empty
      if (form.shippingTerm) payload.shippingTerm = form.shippingTerm;

      // IDs - convert to numbers if they exist
      if (form.customerName)
        payload.custAddressBookId = parseInt(form.customerName);
      if (form.consigneeId)
        payload.consigneeAddressBookId = parseInt(form.consigneeId);
      if (form.shipperId)
        payload.shipperAddressBookId = parseInt(form.shipperId);

      // FIX: Convert productId to number properly
      if (form.productId) {
        const productId =
          typeof form.productId === "string"
            ? parseInt(form.productId)
            : form.productId;
        if (!isNaN(productId)) {
          payload.productId = productId;
        }
      }

      if (form.portOfLoading) payload.polPortId = parseInt(form.portOfLoading);
      if (form.portOfDischarge)
        payload.podPortId = parseInt(form.portOfDischarge);
      if (form.expHandlingAgent)
        payload.expHandlingAgentAddressBookId = parseInt(form.expHandlingAgent);
      if (form.impHandlingAgent)
        payload.impHandlingAgentAddressBookId = parseInt(form.impHandlingAgent);
      if (form.carrierId)
        payload.carrierAddressBookId = parseInt(form.carrierId);
      if (form.emptyReturnDepot)
        payload.emptyReturnDepotAddressBookId = parseInt(form.emptyReturnDepot);

      // Transhipment port if enabled
      if (form.enableTranshipmentPort && form.transhipmentPortName) {
        payload.transhipmentPortId = parseInt(form.transhipmentPortName);
      }

      // Other numerical fields - use defaults if not provided
      payload.polFreeDays = form.freeDays1 || "0";
      payload.podFreeDays = form.freeDays2 || "0";
      payload.polDetentionRate = form.detentionRate1 || "0";
      payload.podDetentionRate = form.detentionRate2 || "0";
      payload.quantity = form.quantity || String(selectedContainers.length);
      payload.vesselName = form.vesselName || "Default Vessel";

      // Date fields - use current date as fallback
      if (form.gateClosingDate)
        payload.gsDate = new Date(form.gateClosingDate).toISOString();
      if (form.sobDate) payload.sob = new Date(form.sobDate).toISOString();
      if (form.etaToPod)
        payload.etaTopod = new Date(form.etaToPod).toISOString();
      if (form.estimatedEmptyReturnDate)
        payload.estimateDate = new Date(
          form.estimatedEmptyReturnDate
        ).toISOString();

      // Always include containers
      if (selectedContainers.length > 0) {
        payload.containers = selectedContainers.map((c: any) => ({
          containerNumber: c.containerNumber || "",
          capacity: c.capacity || "",
          tare: c.tare || "",
          inventoryId: c.inventoryId || null,
          portId: c.portId || null,
          depotName: c.depotName || "",
        }));
      }

      console.log("Payload being sent:", payload); // Debug log

      if (form.id) {
        // For PATCH (Edit)
        await axios.patch(`http://localhost:8000/shipment/${form.id}`, payload);
        alert("Shipment updated successfully!");
      } else {
        // For POST (New)
        await axios.post("http://localhost:8000/shipment", payload);
        alert("Shipment created successfully!");
      }

      if (refreshShipments) refreshShipments(); // Refresh parent
      onClose(); // Close modal
    } catch (error: any) {
      console.error("Error submitting shipment", error);
      alert(
        `Failed to submit shipment: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleImportData = async () => {
    if (!form.quotationRefNo) return;
    try {
      const res = await axios.get(
        `http://localhost:8000/shipment/quotation/${encodeURIComponent(
          form.quotationRefNo
        )}`
      );
      const data = res.data;

      const customer = data.custAddressBook
        ? [
            {
              id: data.custAddressBook.id,
              name: data.custAddressBook.companyName,
            },
          ]
        : [];

      const productList = data.product
        ? [
            {
              id: data.product.id ?? 0,
              productId: data.product.productId,
              productName: data.product.productName,
              productType: data.product.productType || "",
            },
          ]
        : [];

      const selectedProduct = productList.find(
        (p) => p.productId === data.product?.productId
      );
      const portMap = new Map<number, Option>();
      [data.polPort, data.podPort, data.transhipmentPort].forEach((p) => {
        if (p && !portMap.has(p.id)) {
          portMap.set(p.id, { id: p.id, name: p.portName });
        }
      });
      const port = Array.from(portMap.values());

      const agentMap = new Map<number, string>();

      const fetchAgentNameById = async (id: number) => {
        const res = await axios.get(`http://localhost:8000/addressbook/${id}`);
        return res.data.companyName;
      };

      if (data.expHandlingAgentAddressBook) {
        agentMap.set(
          data.expHandlingAgentAddressBook.id,
          data.expHandlingAgentAddressBook.companyName
        );
      } else if (data.expHandlingAgentAddressBookId) {
        const name = await fetchAgentNameById(
          data.expHandlingAgentAddressBookId
        );
        agentMap.set(data.expHandlingAgentAddressBookId, name);
      }

      if (data.impHandlingAgentAddressBook) {
        agentMap.set(
          data.impHandlingAgentAddressBook.id,
          data.impHandlingAgentAddressBook.companyName
        );
      } else if (
        data.impHandlingAgentAddressBookId &&
        !agentMap.has(data.impHandlingAgentAddressBookId)
      ) {
        const name = await fetchAgentNameById(
          data.impHandlingAgentAddressBookId
        );
        agentMap.set(data.impHandlingAgentAddressBookId, name);
      }

      const agent = Array.from(agentMap.entries()).map(([id, name]) => ({
        id,
        name,
      }));

      const depot = [];
      if (data.emptyReturnAddressBook) {
        depot.push({
          id: data.emptyReturnAddressBook.id,
          name: data.emptyReturnAddressBook.companyName,
        });
      } else if (data.emptyReturnAddressBookId) {
        const name = await fetchAgentNameById(data.emptyReturnAddressBookId);
        depot.push({
          id: data.emptyReturnAddressBookId,
          name,
        });
      }

      const shippingTerm = data.shippingTerm
        ? [{ id: data.shippingTerm, name: data.shippingTerm }]
        : [];

      setSelectOptions({
        customer,
        product: productList,
        port,
        agent,
        depot,
        shippingTerm,
      });

      // FIX: First set the form with basic data - properly set customer display name
      const updatedForm = {
        ...form,
        shippingTerm: data.shippingTerm || "",
        customerName: data.custAddressBook?.id?.toString() || "",
        // FIX: Set the customer display name for the input field
        customerDisplayName: data.custAddressBook?.companyName || "",
        billingParty: data.billingParty || "",
        rateType: data.rateType || "",
        billingType: data.billingType || "",
        productId: selectedProduct?.id || "",
        productName: selectedProduct
          ? `${selectedProduct.productId} - ${selectedProduct.productName} - ${selectedProduct.productType}`
          : "",
        productDisplayName: selectedProduct
          ? `${selectedProduct.productId} - ${selectedProduct.productName} - ${selectedProduct.productType}`
          : "",
        portOfLoading: data.polPort?.id?.toString() || "",
        portOfLoadingName: data.polPort?.portName || "",
        portOfDischarge: data.podPort?.id?.toString() || "",
        portOfDischargeName: data.podPort?.portName || "",
        freeDays1: data.polFreeDays || "",
        detentionRate1: data.polDetentionRate || "",
        freeDays2: data.podFreeDays || "",
        detentionRate2: data.podDetentionRate || "",
        expHandlingAgent:
          (
            data.expHandlingAgentAddressBook?.id ||
            data.expHandlingAgentAddressBookId
          )?.toString() || "",
        expHandlingAgentName:
          data.expHandlingAgentAddressBook?.companyName ||
          (data.expHandlingAgentAddressBookId
            ? await fetchAgentNameById(data.expHandlingAgentAddressBookId)
            : ""),
        impHandlingAgent:
          (
            data.impHandlingAgentAddressBook?.id ||
            data.impHandlingAgentAddressBookId
          )?.toString() || "",
        impHandlingAgentName:
          data.impHandlingAgentAddressBook?.companyName ||
          (data.impHandlingAgentAddressBookId
            ? await fetchAgentNameById(data.impHandlingAgentAddressBookId)
            : ""),
        emptyReturnDepot:
          (
            data.emptyReturnAddressBook?.id || data.emptyReturnAddressBookId
          )?.toString() || "",
        emptyReturnDepotName:
          data.emptyReturnAddressBook?.companyName ||
          (data.emptyReturnAddressBookId
            ? await fetchAgentNameById(data.emptyReturnAddressBookId)
            : ""),
        enableTranshipmentPort: !!data.transhipmentPort,
        transhipmentPortName: data.transhipmentPort
          ? data.transhipmentPort.id.toString()
          : undefined,
      };

      // Set the form first
      setForm(updatedForm);

      // FIX: After setting the form, fetch the filtered agents and depots
      const fetchPromises = [];

      if (data.polPort?.id) {
        fetchPromises.push(fetchExpHandlingAgentsByPort(data.polPort.id));
      }

      if (data.podPort?.id) {
        fetchPromises.push(fetchImpHandlingAgentsByPort(data.podPort.id));
        fetchPromises.push(fetchEmptyReturnDepotsByPort(data.podPort.id));
      }

      // Wait for all filtered data to be fetched
      await Promise.all(fetchPromises);

      // Trigger auto-selection for container modal after import
      setTimeout(() => {
        autoSelectPortInModal();
      }, 100); // Small delay to ensure state updates are processed
    } catch (err) {
      console.error("Failed to import data from quotation", err);
      alert('Quotation not found or fetch error');
    }
  };

  useEffect(() => {
    const fetchNextJobNumber = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/shipment/next-job-number"
        );
        setForm((prev: any) => ({
          ...prev,
          jobNumber: res.data.jobNumber || "",
        }));
      } catch (err) {
        console.error("Failed to fetch job number", err);
      }
    };

    if (!form.id) {
      fetchNextJobNumber();
    }
  }, []);

  useEffect(() => {
    const fetchConsignee: () => Promise<void> = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const consignee = data.filter(
          (entry: any) =>
            entry.businessType && entry.businessType.includes("Consignee")
        );
        setConsigneeSuggestions(consignee);
      } catch (err) {
        console.error("Error fetching consignee:", err);
      }
    };

    fetchConsignee();
  }, []);

  useEffect(() => {
    const fetchShipper: () => Promise<void> = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const shipper = data.filter(
          (entry: any) =>
            entry.businessType && entry.businessType.includes("Shipper")
        );
        setShipperSuggestions(shipper);
      } catch (err) {
        console.error("Error fetching shipper:", err);
      }
    };

    fetchShipper();
  }, []);

  useEffect(() => {
    const fetchCarrier: () => Promise<void> = async () => {
      try {
        const res = await fetch("http://localhost:8000/addressbook");
        const data = await res.json();
        const carrier = data.filter(
          (entry: any) =>
            entry.businessType && entry.businessType.includes("Carrier")
        );
        setCarrierSuggestions(carrier);
      } catch (err) {
        console.error("Error fetching carrier:", err);
      }
    };

    fetchCarrier();
  }, []);

  useEffect(() => {
    if (form.etaToPod && form.freeDays2) {
      const etaDate = new Date(form.etaToPod);
      const freeDays = parseInt(form.freeDays2, 10);

      if (!isNaN(freeDays)) {
        const returnDate = new Date(etaDate);
        returnDate.setDate(etaDate.getDate() + freeDays);

        const formatted = returnDate.toISOString().split("T")[0];
        setForm((prev: any) => ({
          ...prev,
          estimatedEmptyReturnDate: formatted,
        }));
      }
    }
  }, [form.etaToPod, form.freeDays2]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("http://localhost:8000/inventory");
        const data = await res.json();
        setAllInventories(data);
      } catch (error) {
        console.error("Error fetching inventories:", error);
      }
    };

    fetchInventory();
  }, []);
  const getContainerSize = (inventoryId: number) => {
    const inv = allInventories.find((i) => i.id === inventoryId);
    return inv?.containerSize || "N/A";
  };

  // Professional Top Alert Component
  const ProfessionalTopAlert = () => (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-500 ease-out ${
      showValidationAlert 
        ? 'translate-y-0 opacity-100 scale-100' 
        : '-translate-y-full opacity-0 scale-95'
    }`}>
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 min-w-[400px] border border-red-400">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
        </div>
        <div className="flex-grow">
          <p className="font-medium text-sm">Please fill all the required fields</p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowValidationAlert(false);
            setValidationErrors({});
          }}
          className="flex-shrink-0 hover:bg-red-700 rounded-full p-1 transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );



  // --- UI Starts Here - Updated with AddProductForm styling ---
  return (
    <>
      <ProfessionalTopAlert />
      <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-lg">
      <Dialog open onOpenChange={onClose}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="!w-[90vw] !max-w-[1200px] min-w-0 bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-0 border border-neutral-800"
        >
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {formTitle}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
            {/* Import Data from Quotation */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                  Import Data from Quotation
                </h3>
              </div>
              <div className="flex items-end gap-4 w-full p-2 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                <div className="flex-1 relative">
                  <Label
                    htmlFor="quotationRefNo"
                    className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                  >
                    Quotation Reference Number
                  </Label>
                  <Input
                    id="quotationRefNo"
                    type="text"
                    value={form.quotationRefNo || ""}
                    onChange={(e) => {
                      setForm({ ...form, quotationRefNo: e.target.value });
                      toggleSuggestions("quotation", true);
                    }}
                    onFocus={() => {
                      // In edit mode, don't show suggestions automatically on focus
                      // Only show suggestions when user starts typing (onChange will handle that)
                      if (form.id) {
                        toggleSuggestions("quotation", false);
                      } else {
                        // For new forms, show suggestions on focus if there's text
                        if (form.quotationRefNo) {
                          toggleSuggestions("quotation", true);
                        }
                      }
                    }}
                    onBlur={() =>
                      setTimeout(
                        () => toggleSuggestions("quotation", false),
                        150
                      )
                    }
                    placeholder="Enter quotation reference number"
                    className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                  />
                  {showSuggestions.quotation && form.quotationRefNo && (
                    <div className="absolute z-[9999] w-full mt-1 max-h-40 overflow-hidden">
                      <ul className="bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded shadow-lg max-h-40 overflow-y-auto">
                        {Array.isArray(quotationSuggestions) &&
                          quotationSuggestions
                            .filter((q) => {
                              const quotationRef = q.quotationRefNumber || q.quotationRefNo || "";
                              const searchTerm = (form.quotationRefNo || "").toLowerCase();
                              return quotationRef.toLowerCase().includes(searchTerm);
                            })
                            .slice(0, 10) // Limit to 10 results
                            .map((quotation) => (
                              <li
                                key={quotation.id}
                                                              onMouseDown={() => {
                                const quotationRef = quotation.quotationRefNumber || quotation.quotationRefNo || "";
                                setForm((prev: any) => ({
                                  ...prev,
                                  quotationRefNo: quotationRef,
                                }));
                                toggleSuggestions("quotation", false);
                              }}
                              className="px-3 py-2 cursor-pointer text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-500"
                            >
                              <div className="font-medium">{quotation.quotationRefNumber || quotation.quotationRefNo || "No Ref"}</div>
                              <div className="text-xs text-black-400">
                                {quotation.custAddressBook?.companyName || "Unknown Customer"}
                              </div>
                            </li>
                            ))}
                        {Array.isArray(quotationSuggestions) &&
                          quotationSuggestions.filter((q) => {
                            const quotationRef = q.quotationRefNumber || q.quotationRefNo || "";
                            const searchTerm = (form.quotationRefNo || "").toLowerCase();
                            return quotationRef.toLowerCase().includes(searchTerm);
                          }).length === 0 && (
                                                      <li className="px-3 py-2 text-neutral-400 text-sm">
                              No quotations found
                            </li>
                        )}
                        {!Array.isArray(quotationSuggestions) && (
                          <li className="px-3 py-2 text-neutral-400 text-sm">
                            Loading quotations...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    Import shipping details from an existing quotation to
                    auto-fill similar fields.
                  </p>
                </div>
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded mb-5 cursor-pointer"
                  onClick={handleImportData}
                >
                  Import Data
                </Button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                  Basic Information
                </h3>
              </div>
              <div className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 bg-white dark:bg-neutral-900 rounded">
                  <div>
                    <Label
                      htmlFor="date"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Date (DD/MM/YY) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date || ""}
                      onChange={(e) => {
                        setForm({ ...form, date: e.target.value });
                        if (validationErrors.date) {
                          setValidationErrors(prev => ({...prev, date: ""}));
                        }
                      }}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {validationErrors.date && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.date}</p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="jobNumber"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Job Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="jobNumber"
                      type="text"
                      value={form.jobNumber || ""}
                      onChange={(e) => {
                        setForm({ ...form, jobNumber: e.target.value });
                        if (validationErrors.jobNumber) {
                          setValidationErrors(prev => ({...prev, jobNumber: ""}));
                        }
                      }}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {validationErrors.jobNumber && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.jobNumber}</p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="referenceNumber"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Reference Number
                    </Label>
                    <Input
                      id="referenceNumber"
                      type="text"
                      value={form.referenceNumber || ""}
                      onChange={(e) =>
                        setForm({ ...form, referenceNumber: e.target.value })
                      }
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="masterBL"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Master BL
                    </Label>
                    <Input
                      id="masterBL"
                      type="text"
                      value={form.masterBL || ""}
                      onChange={(e) =>
                        setForm({ ...form, masterBL: e.target.value })
                      }
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="shippingTerm"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Shipment Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.shippingTerm || ""}
                      onValueChange={(value) => {
                        setForm({ ...form, shippingTerm: value });
                        if (validationErrors.shippingTerm) {
                          setValidationErrors(prev => ({...prev, shippingTerm: ""}));
                        }
                      }}
                      disabled={!!form.quotationRefNo}
                    >
                      <SelectTrigger
                        className={`w-full p-2 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700 ${
                          form.quotationRefNo
                            ? "cursor-not-allowed opacity-75"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select Shipping Term" />
                      </SelectTrigger>
                      <SelectContent className="text-sm text-gray-900 dark:text-white">
                        {selectOptions.shippingTerm.map((term) => (
                          <SelectItem key={term.id} value={term.id.toString()}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>  
                    </Select>
                    {validationErrors.shippingTerm && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.shippingTerm}</p>
                    )}
                  </div>
                  <div className="relative">
                    <Label
                      htmlFor="customerName"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Customer Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={form.customerDisplayName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          customerDisplayName: e.target.value,
                          customerName: null,
                        }));
                        toggleSuggestions("customer", true);
                        if (validationErrors.customerName) {
                          setValidationErrors(prev => ({...prev, customerName: ""}));
                        }
                      }}
                      onFocus={() => toggleSuggestions("customer", true)}
                      onBlur={() =>
                        setTimeout(
                          () => toggleSuggestions("customer", false),
                          150
                        )
                      }
                      placeholder="Start typing customer name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.customer && form.customerDisplayName && (
                      <div className="absolute z-[9999] w-full mt-1 max-h-40 overflow-hidden">
                        <ul className="bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded shadow-lg max-h-40 overflow-y-auto">
                          {customerSuggestions
                            .filter((c) =>
                              c.companyName
                                .toLowerCase()
                                .includes(
                                  form.customerDisplayName.toLowerCase()
                                )
                            )
                            .slice(0, 10) // Limit to 10 results to prevent overflow
                            .map((company) => (
                              <li
                                key={company.id}
                                onMouseDown={() => {
                                  setForm((prev: any) => ({
                                    ...prev,
                                    customerDisplayName: company.companyName,
                                    customerName: company.id,
                                  }));
                                  toggleSuggestions("customer", false);
                                }}
                                className="px-3 py-2 cursor-pointer text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600"
                              >
                                {company.companyName}
                              </li>
                            ))}
                          {customerSuggestions.filter((c) =>
                            c.companyName
                              .toLowerCase()
                              .includes(form.customerDisplayName?.toLowerCase())
                          ).length === 0 && (
                            <li className="px-3 py-2 text-neutral-400 text-sm">
                              No match found
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    {validationErrors.customerName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.customerName}</p>
                    )}
                  </div>

                  {/* Product Name - Fix dropdown positioning */}
                  <div className="relative">
                    <Label
                      htmlFor="productName"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="productName"
                      type="text"
                      value={form.productDisplayName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          productDisplayName: e.target.value,
                          productId: null,
                          productName: null,
                        }));
                        toggleSuggestions("product", true);
                        if (validationErrors.productName) {
                          setValidationErrors(prev => ({...prev, productName: ""}));
                        }
                      }}
                      onFocus={() => toggleSuggestions("product", true)}
                      onBlur={() =>
                        setTimeout(
                          () => toggleSuggestions("product", false),
                          150
                        )
                      }
                      placeholder="Start typing product name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.product && form.productDisplayName && (
                      <div className="absolute z-[9999] w-full mt-1 max-h-40 overflow-hidden">
                        <ul className="bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded shadow-lg max-h-40 overflow-y-auto">
                          {productSuggestions
                            .filter((p) =>
                              `${p.productId} - ${p.productName} - ${p.productType}`
                                .toLowerCase()
                                .includes(form.productDisplayName.toLowerCase())
                            )
                            .slice(0, 10) // Limit to 10 results
                            .map((product) => (
                              <li
                                key={product.id}
                                onMouseDown={() => {
                                  const displayName = `${product.productId} - ${product.productName} - ${product.productType}`;
                                  setForm((prev: any) => ({
                                    ...prev,
                                    productDisplayName: displayName,
                                    productId: product.id,
                                    productName: displayName,
                                  }));
                                  toggleSuggestions("product", false);
                                }}
                                className="px-3 py-2 cursor-pointer text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600"
                              >
                                {`${product.productId} - ${product.productName} - ${product.productType}`}
                              </li>
                            ))}
                          {productSuggestions.filter((p) =>
                            `${p.productId} - ${p.productName} - ${p.productType}`
                              .toLowerCase()
                              .includes(form.productDisplayName?.toLowerCase())
                          ).length === 0 && (
                            <li className="px-3 py-2 text-neutral-400 text-sm">
                              No match found
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    {validationErrors.productName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.productName}</p>
                    )}
                  </div>

                  {/* Consignee Name - Fix dropdown visibility */}
                  <div className="relative">
                    <Label
                      htmlFor="consigneeName"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Consignee Name
                    </Label>
                    <Input
                      id="consigneeName"
                      type="text"
                      value={form.consigneeName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          consigneeName: e.target.value,
                          consigneeId: null,
                        }));
                        toggleSuggestions("consignee", true);
                      }}
                      onFocus={() => toggleSuggestions("consignee", true)}
                      onBlur={() =>
                        setTimeout(
                          () => toggleSuggestions("consignee", false),
                          150
                        )
                      }
                      placeholder="Start typing consignee name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.consignee && form.consigneeName && (
                      <ul className="absolute z-[9999] w-full bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {consigneeSuggestions
                          .filter((c) =>
                            c.companyName
                              .toLowerCase()
                              .includes(form.consigneeName.toLowerCase())
                          )
                          .map((company) => (
                            <li
                              key={company.id}
                              onMouseDown={() => {
                                setForm((prev: any) => ({
                                  ...prev,
                                  consigneeName: company.companyName,
                                  consigneeId: company.id,
                                }));
                                toggleSuggestions("consignee", false);
                              }}
                              className="px-3 py-1 cursor-pointer text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600"
                            >
                              {company.companyName}
                            </li>
                          ))}
                        {consigneeSuggestions.filter((c) =>
                          c.companyName
                            .toLowerCase()
                            .includes(form.consigneeName?.toLowerCase())
                        ).length === 0 && (
                          <li className="px-3 py-1 text-neutral-400 text-sm">
                            No match found
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Shipper Name - Fix dropdown visibility */}
                  <div className="relative">
                    <Label
                      htmlFor="shipperName"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Shipper Name
                    </Label>
                    <Input
                      id="shipperName"
                      type="text"
                      value={form.shipperName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          shipperName: e.target.value,
                          shipperId: null,
                        }));
                        toggleSuggestions("shipper", true);
                      }}
                      onFocus={() => toggleSuggestions("shipper", true)}
                      onBlur={() =>
                        setTimeout(
                          () => toggleSuggestions("shipper", false),
                          150
                        )
                      }
                      placeholder="Start typing shipper name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.shipper && form.shipperName && (
                      <ul className="absolute z-[9999] w-full bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {shipperSuggestions
                          .filter((c) =>
                            c.companyName
                              .toLowerCase()
                              .includes(form.shipperName.toLowerCase())
                          )
                          .map((company) => (
                            <li
                              key={company.id}
                              onMouseDown={() => {
                                setForm((prev: any) => ({
                                  ...prev,
                                  shipperName: company.companyName,
                                  shipperId: company.id,
                                }));
                                toggleSuggestions("shipper", false);
                              }}
                              className="px-3 py-1 cursor-pointer text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600"
                            >
                              {company.companyName}
                            </li>
                          ))}
                        {shipperSuggestions.filter((c) =>
                          c.companyName
                            .toLowerCase()
                            .includes(form.shipperName?.toLowerCase())
                        ).length === 0 && (
                          <li className="px-3 py-1 text-neutral-400 text-sm">
                            No match found
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Port Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                  Port Information
                </h3>
              </div>
              <div className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 bg-white dark:bg-neutral-900 rounded">
                  {/* Port of Loading - Fix dropdown visibility */}
                  <div className="relative">
                    <Label
                      htmlFor="portOfLoading"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Port of Loading <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="portOfLoading"
                      type="text"
                      value={form.portOfLoadingName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          portOfLoadingName: e.target.value,
                          portOfLoading: null,
                        }));
                        toggleSuggestions("portLoading", true);
                        if (validationErrors.portOfLoading) {
                          setValidationErrors(prev => ({...prev, portOfLoading: ""}));
                        }
                      }}
                      onFocus={() => toggleSuggestions("portLoading", true)}
                      onBlur={() =>
                        setTimeout(
                          () => toggleSuggestions("portLoading", false),
                          150
                        )
                      }
                      placeholder="Start typing port name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.portLoading && form.portOfLoadingName && (
                      <ul className="absolute z-[9999] w-full bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {portSuggestions
                          .filter((p) =>
                            p.portName
                              .toLowerCase()
                              .includes(form.portOfLoadingName.toLowerCase())
                          )
                          .map((port) => (
                            <li
                              key={port.id}
                              onMouseDown={() => {
                                setForm((prev: any) => ({
                                  ...prev,
                                  portOfLoadingName: port.portName,
                                  portOfLoading: port.id,
                                }));
                                toggleSuggestions("portLoading", false);

                                // Trigger fetching of EXP handling agents when port is selected
                                fetchExpHandlingAgentsByPort(port.id);

                                // Trigger auto-selection for container modal with proper timing
                                setTimeout(() => {
                                  autoSelectPortInModal();
                                }, 200); // Increased delay to ensure form state is updated
                              }}
                              className="px-3 py-1 cursor-pointer text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600"
                            >
                              {port.portName}
                            </li>
                          ))}
                        {portSuggestions.filter((p) =>
                          p.portName
                            .toLowerCase()
                            .includes(form.portOfLoadingName?.toLowerCase())
                        ).length === 0 && (
                          <li className="px-3 py-1 text-neutral-400 text-sm">
                            No match found
                          </li>
                        )}
                      </ul>
                    )}
                    {validationErrors.portOfLoading && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.portOfLoading}</p>
                    )}
                  </div>

                  {/* Port of Discharge - Fix dropdown visibility */}
                  <div className="relative">
                    <Label
                      htmlFor="portOfDischarge"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Port of Discharge <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="portOfDischarge"
                      type="text"
                      value={form.portOfDischargeName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          portOfDischargeName: e.target.value,
                          portOfDischarge: null,
                        }));
                        toggleSuggestions("portDischarge", true);
                        if (validationErrors.portOfDischarge) {
                          setValidationErrors(prev => ({...prev, portOfDischarge: ""}));
                        }
                      }}
                      onFocus={() => toggleSuggestions("portDischarge", true)}
                      onBlur={() =>
                        setTimeout(
                          () => toggleSuggestions("portDischarge", false),
                          150
                        )
                      }
                      placeholder="Start typing port name..."
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.portDischarge &&
                      form.portOfDischargeName && (
                        <ul className="absolute z-[9999] w-full bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                          {portSuggestions
                            .filter((p) =>
                              p.portName
                                .toLowerCase()
                                .includes(
                                  form.portOfDischargeName.toLowerCase()
                                )
                            )
                            .map((port) => (
                              <li
                                key={port.id}
                                onMouseDown={() => {
                                  setForm((prev: any) => ({
                                    ...prev,
                                    portOfDischargeName: port.portName,
                                    portOfDischarge: port.id,
                                  }));
                                  toggleSuggestions("portDischarge", false);

                                  // Trigger fetching of IMP handling agents and depots when port is selected
                                  fetchImpHandlingAgentsByPort(port.id);
                                  fetchEmptyReturnDepotsByPort(port.id);
                                }}
                                className="px-3 py-1 cursor-pointer text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600"
                              >
                                {port.portName}
                              </li>
                            ))}
                          {portSuggestions.filter((p) =>
                            p.portName
                              .toLowerCase()
                              .includes(form.portOfDischargeName?.toLowerCase())
                          ).length === 0 && (
                            <li className="px-3 py-1 text-neutral-400 text-sm">
                              No match found
                            </li>
                          )}
                        </ul>
                      )}
                    {validationErrors.portOfDischarge && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.portOfDischarge}</p>
                    )}
                  </div>

                  <div className="flex w-full gap-4 col-span-2">
                    <div className="flex-1">
                      <Label
                        htmlFor="freeDays1"
                        className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                      >
                        Free Days
                      </Label>
                      <Input
                        id="freeDays1"
                        type="text"
                        value={form.freeDays1 || ""}
                        onChange={(e) =>
                          setForm({ ...form, freeDays1: e.target.value })
                        }
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="flex-1">
                      <Label
                        htmlFor="detentionRate1"
                        className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                      >
                        Detention Rate
                      </Label>
                      <Input
                        id="detentionRate1"
                        type="text"
                        value={form.detentionRate1 || ""}
                        onChange={(e) =>
                          setForm({ ...form, detentionRate1: e.target.value })
                        }
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="flex-1">
                      <Label
                        htmlFor="freeDays2"
                        className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                      >
                        Free Days
                      </Label>
                      <Input
                        id="freeDays2"
                        type="text"
                        value={form.freeDays2 || ""}
                        onChange={(e) =>
                          setForm({ ...form, freeDays2: e.target.value })
                        }
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                    <div className="flex-1">
                      <Label
                        htmlFor="detentionRate2"
                        className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                      >
                        Detention Rate
                      </Label>
                      <Input
                        id="detentionRate2"
                        type="text"
                        value={form.detentionRate2 || ""}
                        onChange={(e) =>
                          setForm({ ...form, detentionRate2: e.target.value })
                        }
                        className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <Checkbox
                      id="enableTranshipmentPort"
                      checked={!!form.enableTranshipmentPort}
                      onCheckedChange={(checked) =>
                        setForm({
                          ...form,
                          enableTranshipmentPort: checked,
                        })
                      }
                    />
                    <Label
                      htmlFor="enableTranshipmentPort"
                      className="text-gray-900 dark:text-neutral-200 text-sm"
                    >
                      Enable Transhipment Port
                    </Label>
                  </div>
                  {form.enableTranshipmentPort && (
                    <div>
                      <Label
                        htmlFor="transhipmentPortName"
                        className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                      >
                        Transhipment Port
                      </Label>
                      <Select
                        value={form.transhipmentPortName || ""}
                        onValueChange={(value) =>
                          setForm({ ...form, transhipmentPortName: value })
                        }
                      >
                        <SelectTrigger className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700">
                          <SelectValue placeholder="Select Transhipment Port" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-black dark:bg-neutral-800 dark:text-white border border-black-700 dark:border-neutral-700">
                          {selectOptions.port.length > 0 ? (
                            selectOptions.port.map((p) => (
                              <SelectItem
                                key={p.id}
                                value={p.id.toString()}
                                className="text-black dark:text-white hover:bg-neutral-500 dark:hover:bg-neutral-700"
                              >
                                {p.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-port" disabled>
                              No ports available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Handling Agents */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                  Handling Agents
                </h3>
              </div>
              <div className="w-full p-2 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {/* EXP Handling Agent - Change to select dropdown */}
                  <div>
                    <Label
                      htmlFor="expHandlingAgent"
                      className="text-gray-900 dark:text-neutral-200 text-sm mb-1"
                    >
                      EXP Handling Agent <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="expHandlingAgent"
                      value={form.expHandlingAgent || ""}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selected = expAgents.find(
                          (a) => a.id === selectedId
                        );
                        setForm((prev: any) => ({
                          ...prev,
                          expHandlingAgent: selectedId.toString(),
                          expHandlingAgentName: selected?.companyName || "",
                        }));
                        if (validationErrors.expHandlingAgent) {
                          setValidationErrors(prev => ({...prev, expHandlingAgent: ""}));
                        }
                      }}
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    >
                      <option value="">
                        {!form.portOfLoading
                          ? "First Select Port of Loading"
                          : "Select Handling Agent"}
                      </option>
                      {Array.isArray(expAgents) && expAgents.length > 0
                        ? expAgents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.companyName}
                            </option>
                          ))
                        : form.portOfLoading &&
                          expAgents.length === 0 && (
                            <option value="" disabled>
                              Loading agents...
                            </option>
                          )}
                    </select>
                    {validationErrors.expHandlingAgent && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.expHandlingAgent}</p>
                    )}
                  </div>

                  {/* IMP Handling Agent - Change to select dropdown */}
                  <div>
                    <Label
                      htmlFor="impHandlingAgent"
                      className="text-gray-900 dark:text-neutral-200 text-sm mb-1"
                    >
                      IMP Handling Agent <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="impHandlingAgent"
                      value={form.impHandlingAgent || ""}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selected = impHandlingAgents.find(
                          (a) => a.id === selectedId
                        );
                        setForm((prev: any) => ({
                          ...prev,
                          impHandlingAgent: selectedId.toString(),
                          impHandlingAgentName: selected?.companyName || "",
                        }));
                        if (validationErrors.impHandlingAgent) {
                          setValidationErrors(prev => ({...prev, impHandlingAgent: ""}));
                        }
                      }}
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    >
                      <option value="">
                        {!form.portOfDischarge
                          ? "First Select Port of Discharge"
                          : "Select Handling Agent"}
                      </option>
                      {Array.isArray(impHandlingAgents) &&
                      impHandlingAgents.length > 0
                        ? impHandlingAgents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.companyName}
                            </option>
                          ))
                        : form.portOfDischarge &&
                          impHandlingAgents.length === 0 && (
                            <option value="" disabled>
                              Loading agents...
                            </option>
                          )}
                    </select>
                    {validationErrors.impHandlingAgent && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.impHandlingAgent}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Container Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                  Add Inventory
                </h3>
              </div>
              <div className="w-full p-2 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                <div className="mb-4 bg-white dark:bg-neutral-900 rounded">
                  <Label
                    htmlFor="quantity"
                    className="text-gray-900 dark:text-neutral-200 text-sm mb-1"
                  >
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="text"
                    value={form.quantity || ""}
                    onChange={(e) => {
                      setForm({ ...form, quantity: e.target.value });
                      if (validationErrors.quantity) {
                        setValidationErrors(prev => ({...prev, quantity: ""}));
                      }
                    }}
                    className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                  />
                  {validationErrors.quantity && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.quantity}</p>
                  )}
                </div>
                <div className="relative mb-4 bg-white dark:bg-neutral-900 rounded">
                  <Label
                    htmlFor="containerNumber"
                    className="text-gray-900 dark:text-neutral-200 text-sm mb-1"
                  >
                    Container No.
                  </Label>
                  <div className="flex">
                    <Input
                      id="containerNumber"
                      type="text"
                      value={form.containerNumber || ""}
                      onChange={(e) => handleContainerSearch(e.target.value)}
                      placeholder={
                        !form.quantity || isNaN(parseInt(form.quantity)) || parseInt(form.quantity) <= 0
                          ? "Please enter valid quantity first"
                          : "Type at least 2 characters"
                      }
                      disabled={!form.quantity || isNaN(parseInt(form.quantity)) || parseInt(form.quantity) <= 0}
                      className="rounded-l w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700 disabled:bg-gray-100 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed"
                    />
                    <Button
                      type="button"
                      className="rounded-r flex items-center justify-center
                        bg-white hover:bg-blue-100 border border-neutral-200
                        dark:bg-neutral-800 dark:hover:bg-blue-900 dark:border-neutral-700
                        transition-colors disabled:bg-gray-100 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed cursor-pointer"
                      onClick={() => setShowContainerModal(true)}
                      disabled={!form.quantity || isNaN(parseInt(form.quantity)) || parseInt(form.quantity) <= 0}
                    >
                      <Plus className={`w-10 h-10 ${!form.quantity || isNaN(parseInt(form.quantity)) || parseInt(form.quantity) <= 0 ? 'text-gray-400 dark:text-neutral-500' : 'text-blue-600 dark:text-blue-400'} cursor-pointer`}/>
                    </Button>
                  </div>
                  {suggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-700 dark:border-neutral-700 shadow max-h-60 overflow-y-auto">
                      {suggestions.map((sug) => (
                        <li
                          key={sug.id}
                          onClick={() => handleSuggestionSelect(sug)}
                          className="px-4 py-2 hover:bg-neutral-400 dark:hover:bg-neutral-700 cursor-pointer text-sm"
                        >
                          <div className="font-semibold">
                            {sug.inventory.containerNumber}
                          </div>
                          <div className="text-xs text-black-400 flex justify-between">
                          <span>
                              Capacity: {sug.inventory.containerCapacity}{" "}
                              {sug.inventory.capacityUnit}
                            </span>
                          </div>
                          <div className="text-xs text-black-400 mt-1">
                            Location: {sug.addressBook?.companyName} -{" "}
                            {sug.port?.portName}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {selectedContainers.length > 0 && (
                  <div className="mt-6 bg-white dark:bg-neutral-900 rounded">
                    <h5 className="text-gray-900 dark:text-white text-sm font-semibold mb-2">
                      Selected Containers
                    </h5>
                    <div className="max-h-64 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded">
                      <Table>
                      <TableHeader>
                        <TableRow className="bg-white dark:bg-neutral-900 border-b border-neutral-700">
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs">
                            Container No
                          </TableHead>
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs">
                            Capacity
                          </TableHead>
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs">
                            Tare
                          </TableHead>
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs">
                            Last Location
                          </TableHead>
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs">
                            Size
                          </TableHead>
                          <TableHead className="text-gray-900 dark:text-neutral-200 text-xs text-center">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedContainers.map((item: any, index: number) => (
                          <TableRow
                            key={index}
                            className="border-t border-neutral-700"
                          >
                            <TableCell className="text-gray-900 dark:text-white">
                              {item.inventory?.containerNumber ||
                                item.containerNumber ||
                                "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                              {(item.inventory?.capacity ||
                                item.capacity ||
                                "N/A") +
                                " " +
                                (item.inventory?.capacityUnit || "")}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                              {item.tare || item.inventory?.tare || "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                              {(item.depotName || "N/A") +
                                " - " +
                                (item.port?.portName || "N/A")}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                              {getContainerSize(item.inventoryId)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveContainer(index)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2"
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vessel Details - Fix carrier dropdown visibility */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                  Vessel Details
                </h3>
              </div>
              <div className="w-full p-2 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="relative">
                    <Label
                      htmlFor="carrierName"
                      className="text-gray-900 dark:text-neutral-200 text-sm mb-1"
                    >
                      Carrier Name
                    </Label>
                    <Input
                      id="carrierName"
                      type="text"
                      value={form.carrierName || ""}
                      onChange={(e) => {
                        setForm((prev: any) => ({
                          ...prev,
                          carrierName: e.target.value,
                          carrierId: null,
                        }));
                        toggleSuggestions("carrier", true);
                      }}
                      onFocus={() => toggleSuggestions("carrier", true)}
                      onBlur={() =>
                        setTimeout(
                          () => toggleSuggestions("carrier", false),
                          150
                        )
                      }
                      placeholder="Start typing carrier name..."
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {showSuggestions.carrier && form.carrierName && (
                      <ul className="absolute z-[9999] w-full bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {carrierSuggestions
                          .filter((c) =>
                            c.companyName
                              .toLowerCase()
                              .includes(form.carrierName.toLowerCase())
                          )
                          .map((company) => (
                            <li
                              key={company.id}
                              onMouseDown={() => {
                                setForm((prev: any) => ({
                                  ...prev,
                                  carrierName: company.companyName,
                                  carrierId: company.id,
                                }));
                                toggleSuggestions("carrier", false);
                              }}
                              className="px-3 py-1 cursor-pointer text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600"
                            >
                              {company.companyName}
                            </li>
                          ))}
                        {carrierSuggestions.filter((c) =>
                          c.companyName
                            .toLowerCase()
                            .includes(form.carrierName?.toLowerCase())
                        ).length === 0 && (
                          <li className="px-3 py-1 text-neutral-400 text-sm">
                            No match found
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="vesselName"
                      className="text-gray-900 dark:text-neutral-200 text-sm mb-1"
                    >
                      Vessel Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vesselName"
                      type="text"
                      value={form.vesselName || ""}
                      onChange={(e) => {
                        setForm({ ...form, vesselName: e.target.value });
                        if (validationErrors.vesselName) {
                          setValidationErrors(prev => ({...prev, vesselName: ""}));
                        }
                      }}
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                    {validationErrors.vesselName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.vesselName}</p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="gateClosingDate"
                      className="text-gray-900 dark:text-neutral-200 text-sm mb-1"
                    >
                      Gate Closing Date
                    </Label>
                    <Input
                      id="gateClosingDate"
                      type="date"
                      value={form.gateClosingDate || ""}
                      onChange={(e) =>
                        setForm({ ...form, gateClosingDate: e.target.value })
                      }
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="sobDate"
                      className="text-gray-900 dark:text-neutral-200 text-sm mb-1"
                    >
                      SOB Date
                    </Label>
                    <Input
                      id="sobDate"
                      type="date"
                      value={form.sobDate || ""}
                      onChange={(e) =>
                        setForm({ ...form, sobDate: e.target.value })
                      }
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="etaToPod"
                      className="text-gray-900 dark:text-neutral-200 text-sm mb-1"
                    >
                      ETA to PoD
                    </Label>
                    <Input
                      id="etaToPod"
                      type="date"
                      value={form.etaToPod || ""}
                      onChange={(e) =>
                        setForm({ ...form, etaToPod: e.target.value })
                      }
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Return Depot Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                  Return Depot Information
                </h3>
              </div>

              <div className="w-full p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 bg-white dark:bg-neutral-900 rounded">
                  {/* Empty Return Depot - Replace with select dropdown */}
                  <div>
                    <Label
                      htmlFor="emptyReturnDepot"
                      className="block text-sm text-gray-900 dark:text-neutral-200 mb-1"
                    >
                      Empty Return Depot <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="emptyReturnDepot"
                      value={form.emptyReturnDepot || ""}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selected = emptyReturnDepots.find(
                          (d) => d.id === selectedId
                        );
                        setForm((prev: any) => ({
                          ...prev,
                          emptyReturnDepot: selectedId.toString(),
                          emptyReturnDepotName: selected?.companyName || "",
                        }));
                        if (validationErrors.emptyReturnDepot) {
                          setValidationErrors(prev => ({...prev, emptyReturnDepot: ""}));
                        }
                      }}
                      className="w-full p-2.5 bg-white text-gray-900 dark:bg-neutral-800 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    >
                      <option value="">
                        {!form.portOfDischarge
                          ? "First Select Port of Discharge"
                          : "Select Depot"}
                      </option>
                      {Array.isArray(emptyReturnDepots) &&
                      emptyReturnDepots.length > 0
                        ? emptyReturnDepots.map((depot) => (
                            <option key={depot.id} value={depot.id}>
                              {depot.companyName} - {depot.businessType}
                            </option>
                          ))
                        : form.portOfDischarge &&
                          emptyReturnDepots.length === 0 && (
                            <option value="" disabled>
                              Loading depots...
                            </option>
                          )}
                    </select>
                    {validationErrors.emptyReturnDepot && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.emptyReturnDepot}</p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="estimatedEmptyReturnDate"
                      className="text-gray-900 dark:text-neutral-200 text-sm mb-1"
                    >
                      Estimated Empty Return Date
                    </Label>
                    <Input
                      id="estimatedEmptyReturnDate"
                      type="date"
                      value={form.estimatedEmptyReturnDate || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          estimatedEmptyReturnDate: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <DialogFooter className="flex justify-center px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-gray-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer"
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
          {/* New Modal Component for Container Search */}
          <ContainerSearchModal
            open={showContainerModal}
            onClose={() => setShowContainerModal(false)}
            countries={countries}
            ports={ports}
            containers={containers}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedPort={selectedPort}
            setSelectedPort={setSelectedPort}
            onHireDepots={onHireDepots}
            selectedOnHireDepot={selectedOnHireDepot}
            setSelectedOnHireDepot={setSelectedOnHireDepot}
            modalSelectedContainers={modalSelectedContainers}
            setModalSelectedContainers={setModalSelectedContainers}
            setShowContainerModal={setShowContainerModal}
            setSelectedContainers={setSelectedContainers}
            form={form}
            selectedContainers={selectedContainers}
          />
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default AddShipmentModal;
