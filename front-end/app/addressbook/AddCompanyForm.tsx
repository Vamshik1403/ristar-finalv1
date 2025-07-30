import React, { useEffect, useState } from "react";
import { X, Search, AlertTriangle } from "lucide-react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FiSearch } from "react-icons/fi";

const AddCompanyForm = ({
  onClose,
  editData = null,
}: {
  onClose: () => void;
  editData?: any;
}) => {
  const [status, setStatus] = useState("active");
  const [showBankAccounts, setShowBankAccounts] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [showPortsOfBusiness, setShowPortsOfBusiness] = useState(false);
  const [selectedPorts, setSelectedPorts] = useState<any[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  // Add validation error state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  type Port = {
    id: number;
    portName: string;
    portCode: string;
    portType: string;
    // add other properties if needed
  };

  const [allPorts, setAllPorts] = useState<Port[]>([]);
  const [filteredPorts, setFilteredPorts] = useState<Port[]>([]);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [portSearchTerm, setPortSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Main");
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    companyName: "",
    refId: "",
    businessType: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    creditTerms: "",
    creditLimit: 0,
    remark: "",
    countryId: 0,
  });
  const [countries, setCountries] = useState<any[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPortSuggestions, setShowPortSuggestions] = useState(false);
  const [userTypedCountry, setUserTypedCountry] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("http://localhost:8000/country");
        if (!response.ok) {
          throw new Error("Failed to fetch countries");
        }
        const data = await response.json();
        setCountries(data); // assuming `data` is an array of countries
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  const isEditMode = !!editData;

  useEffect(() => {
    if (!isEditMode) {
      fetchNextRefId();
    }
  }, [isEditMode]);

  const fetchNextRefId = async () => {
    try {
      const res = await fetch("http://localhost:8000/addressbook/next-ref-id");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, refId: data.refId }));
    } catch (error) {
      console.error("Failed to fetch next refId:", error);
    }
  };

  useEffect(() => {
    if (countrySearchTerm.length > 0 && userTypedCountry) {
      const filtered = countries.filter((country) =>
        country.countryName.toLowerCase().includes(countrySearchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCountries([]);
      setShowSuggestions(false);
    }
  }, [countrySearchTerm, countries, userTypedCountry]);

  const handleSelectCountry = (country: { id: number; countryName: string }) => {
    setCountrySearchTerm(country.countryName);
    setFormData((prev) => ({ ...prev, countryId: country.id }));
    setShowSuggestions(false); // This line hides the suggestions

    // Clear validation error for country
    if (validationErrors.country) {
      setValidationErrors(prev => ({...prev, country: ""}));
    }
  };

  // Fetch ports from API
  useEffect(() => {
    const fetchPorts = async () => {
      const response = await axios.get("http://localhost:8000/ports");
      setAllPorts(response.data);
    };
    fetchPorts();
  }, []);

  // Filter ports based on type and search
  useEffect(() => {
    const filtered = allPorts.filter(
      (port) =>
        port.portType.toLowerCase() === selectedType.toLowerCase() &&
        (port.portName.toLowerCase().includes(portSearchTerm.toLowerCase()) ||
          port.portCode.toLowerCase().includes(portSearchTerm.toLowerCase()))
    );
    setFilteredPorts(filtered);
  }, [portSearchTerm, selectedType, allPorts]);

  const togglePortSelect = (port: Port) => {
    if (selectedPorts.find((p) => p.portName === port.portName)) {
      setSelectedPorts(selectedPorts.filter((p) => p.portName !== port.portName));
    } else {
      setSelectedPorts([...selectedPorts, port]);
      // Clear search term after adding a port
      setPortSearchTerm("");
    }
  };

  useEffect(() => {
    if (editData) {
      setFormData({
        companyName: editData.companyName || "",
        refId: editData.refId || "",
        businessType: editData.businessType || "",
        address: editData.address || "",
        phone: editData.phone || "",
        email: editData.email || "",
        website: editData.website || "",
        creditTerms: editData.creditTerms || "",
        creditLimit: editData.creditLimit || 0,
        remark: editData.remark || "",
        countryId: editData.countryId || 0,
      });

      setStatus(editData.status ? editData.status.toLowerCase() : "active");
      // Always set as array, regardless of input type
      setBusinessTypes(
        Array.isArray(editData.businessType)
          ? editData.businessType
          : editData.businessType.split(/\s*,\s*/).map((s: string) => s.trim())
      );
      setBankAccounts(
        editData.bankDetails?.map((b: any) => ({
          accountNo: b.accountNumber,
          bankName: b.bankName,
          address: b.address,
          usci: b.usci,
          branchName: b.branchName,
          branchCode: b.branchCode,
          swiftCode: b.swiftCode,
          currency: b.currency || "",
        })) || []
      );
      setContacts(editData.contacts || []);
      setSelectedPorts(
        (editData.businessPorts || [])
          .filter((bp: any) => bp?.port)
          .map((bp: any) => bp.port)
      );
    }
  }, [editData]);

  const addBankAccount = () => {
    setBankAccounts([
      ...bankAccounts,
      {
        accountNo: "",
        bankName: "",
        address: "",
        usci: "",
        branchName: "",
        branchCode: "",
        swiftCode: "",
        currency: "",
      },
    ]);
  };

  const removeBankAccount = (index: number) => {
    const updated = [...bankAccounts];
    updated.splice(index, 1);
    setBankAccounts(updated);
  };

  const addContact = () => {
    setContacts([
      ...contacts,
      {
        title: "",
        firstName: "",
        lastName: "",
        designation: "",
        department: "",
        email: "",
        mobile: "",
        landline: "",
      },
    ]);
  };

  const removeContact = (index: number) => {
    const updated = [...contacts];
    updated.splice(index, 1);
    setContacts(updated);
  };

  const handleBusinessTypeChange = (type: string) => {
    setBusinessTypes(
      (prev) =>
        prev.includes(type)
          ? prev.filter((t) => t !== type) // remove if already selected
          : [...prev, type] // add if not selected
    );

    // Clear validation error for business types
    if (validationErrors.businessTypes) {
      setValidationErrors(prev => ({...prev, businessTypes: ""}));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    // Convert countryId to number
    setFormData({
      ...formData,
      [id]: id === "countryId" ? Number(value) : value,
    });

    // Clear validation error for this field
    if (validationErrors[id]) {
      setValidationErrors(prev => ({...prev, [id]: ""}));
    }
  };

  const handleAddCompanyClick = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Validate required fields
    const errors: {[key: string]: string} = {};
    
    if (!formData.companyName) {
      errors.companyName = "Please fill this field";
    }
    
    if (!formData.address) {
      errors.address = "Please fill this field";
    }

    // Validate status
    if (!status) {
      errors.status = "Please fill this field";
    }

    // Validate country
    if (!formData.countryId || formData.countryId === 0) {
      errors.country = "Please fill this field";
    }

    // Validate business types
    if (businessTypes.length === 0) {
      errors.businessTypes = "Please fill this field";
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

    // Case-insensitive uniqueness check for company name
    if (!editData) {
      try {
        const response = await axios.get("http://localhost:8000/addressbook");
        const existingCompanies = response.data;
        
        const duplicateCompany = existingCompanies.find((company: any) => 
          company.companyName.toLowerCase() === formData.companyName.toLowerCase()
        );
        
        if (duplicateCompany) {
          alert(`Company with name "${formData.companyName}" already exists match with "${duplicateCompany.companyName}")!`);
          return;
        }
      } catch (err) {
        console.error("Failed to check for duplicate companies:", err);
      }
    } else {
      // For edit mode, check if there's another company with same name (case-insensitive) but different ID
      try {
        const response = await axios.get("http://localhost:8000/addressbook");
        const existingCompanies = response.data;
        
        const duplicateCompany = existingCompanies.find((company: any) => 
          company.id !== editData.id && 
          company.companyName.toLowerCase() === formData.companyName.toLowerCase()
        );
        
        if (duplicateCompany) {
          alert(`Company with name "${formData.companyName}" already exists (case-insensitive match with "${duplicateCompany.companyName}")!`);
          return;
        }
      } catch (err) {
        console.error("Failed to check for duplicate companies:", err);
      }
    }

    const payload = {
      status: status,
      ...formData,
      creditLimit: String(formData.creditLimit),
      businessType: businessTypes.join(", "),
      remark: formData.remark || "",
      bankDetails: bankAccounts.map((b) => ({
        bankName: b.bankName,
        accountNumber: b.accountNo,
        address: b.address,
        usci: b.usci,
        branchName: b.branchName,
        branchCode: b.branchCode,
        swiftCode: b.swiftCode,
        currency: b.currency,
      })),
      businessPorts: selectedPorts.map((p) => ({ portId: p.id })),
      contacts: contacts.map((c) => ({
        title: c.title,
        firstName: c.firstName,
        lastName: c.lastName,
        designation: c.designation,
        department: c.department,
        email: c.email,
        mobile: c.mobile,
        landline: c.landline,
      })),
    };

    try {
      if (editData && editData.id) {
        await axios.patch(
          `http://localhost:8000/addressbook/${editData.id}`,
          payload
        );
        alert("Company updated successfully");
      } else {
        await axios.post("http://localhost:8000/addressbook", payload);
        alert("Company added successfully");
      }
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409 || (err.response?.data?.message && err.response.data.message.includes('already exists'))) {
        alert('Company with this name already exists!');
        onClose(); // Close the form/modal after alert
      } else {
        alert(editData ? "Failed to update company" : "Failed to add company");
      }
    }
  };

  // Replace inputField helper to use shadcn Input
  const inputField = ({
    label,
    id,
    index,
    isFull = false,
  }: {
    label: string;
    id: keyof (typeof bankAccounts)[0];
    index: number;
    isFull?: boolean;
  }) => (
    <div className={isFull ? "md:col-span-2" : ""}>
      <label
        htmlFor={`${String(id)}-${index}`}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <Input
        id={`${String(id)}-${index}`}
        value={bankAccounts[index][id] || ""}
        onChange={(e: { target: { value: any; }; }) => {
          const updated = [...bankAccounts];
          updated[index][id] = e.target.value;
          setBankAccounts(updated);
        }}
        className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  // Ensure countrySearchTerm is set in edit mode when countries are loaded
  useEffect(() => {
    if (isEditMode && countries.length > 0 && formData.countryId) {
      const found = countries.find(c => c.id === formData.countryId);
      if (found && found.countryName !== countrySearchTerm) {
        setCountrySearchTerm(found.countryName);
        setShowSuggestions(false); // Hide suggestions when setting programmatically
        setUserTypedCountry(false); // Mark as not user-typed
      }
    }
    // Only run when countries, editData, or formData.countryId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, countries, formData.countryId]);

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

  return (
    <>
      <ProfessionalTopAlert />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg">
      <Dialog open onOpenChange={onClose} modal={true}>
        <DialogContent className="max-w-2xl w-full bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto p-0 border border-neutral-200 dark:border-neutral-800" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <DialogTitle className="text-xl font-semibold text-black dark:text-white">
              {editData ? "Edit Company" : "Add New Company"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAddCompanyClick();
            }}
          >
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-neutral-900">
              {/* Status Dropdown */}
              <div className="col-span-2">
                <label htmlFor="status" className="block text-sm font-medium text-black dark:text-neutral-200 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select value={status} onValueChange={(value) => {
                  setStatus(value);
                  if (validationErrors.status) {
                    setValidationErrors(prev => ({...prev, status: ""}));
                  }
                }}>
                  <SelectTrigger className="w-full bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700">
                    <SelectItem value="active" className="text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer">
                      Active
                    </SelectItem>
                    <SelectItem value="inactive" className="text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.status && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.status}</p>
                )}
              </div>
              {/* Main Fields */}
              {[
                {
                  id: "companyName",
                  label: "Company Name",
                  required: true,
                  type: "text",
                },
                {
                  id: "refId",
                  label: "Reference No.",
                  type: "text",
                  readOnly: true,
                },
                {
                  id: "address",
                  label: "Address",
                  required: true,
                  type: "textarea",
                  fullWidth: true,
                },
                { id: "phone", label: "Phone", type: "text" },
                { id: "email", label: "Email", type: "email" },
                { id: "website", label: "Website", type: "text" },
                { id: "creditTerms", label: "Credit Terms", type: "text" },
                { id: "creditLimit", label: "Credit Limit", type: "text" },
                {
                  id: "remark",
                  label: "Remark for Documentation",
                  type: "textarea",
                  fullWidth: true,
                },
              ].map((field) => (
                <div key={field.id} className={field.fullWidth ? "col-span-2" : ""}>
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-black dark:text-neutral-200 mb-1"
                  >
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.id}
                      rows={3}
                      value={(formData as any)[field.id] ?? ""}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type}
                      value={(formData as any)[field.id] ?? ""}
                      onChange={handleInputChange}
                      readOnly={field.readOnly}
                      className="w-full bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                  {validationErrors[field.id] && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors[field.id]}</p>
                  )}
                </div>
              ))}
              {/* Country Search */}
              <div
                className="relative w-full max-w-md col-span-2"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setShowSuggestions(false);
                  }
                }}
                tabIndex={-1}
              >
                <label htmlFor="countrySearch" className="block text-sm font-medium text-black dark:text-neutral-200 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    id="countrySearch"
                    value={countrySearchTerm}
                    onChange={e => {
                      setCountrySearchTerm(e.target.value);
                      setUserTypedCountry(true); // Only show suggestions if user typed
                      // Clear validation error for country
                      if (validationErrors.country) {
                        setValidationErrors(prev => ({...prev, country: ""}));
                      }
                    }}
                    onFocus={() => {
                      if (countrySearchTerm && userTypedCountry) setShowSuggestions(true);
                    }}
                    placeholder="Type to search country..."
                    className="w-full pr-10 bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {countrySearchTerm && (
                      <button 
                        type="button"
                        onClick={() => {
                          setCountrySearchTerm('');
                          setFormData(prev => ({ ...prev, countryId: 0 }));
                        }}
                        className="text-neutral-400 hover:text-white cursor-pointer"
                        title="Clear country selection"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <FiSearch className="text-neutral-400" />
                  </div>
                </div>
                {showSuggestions && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-neutral-900 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <li
                          key={country.id}
                          className="px-4 py-2 cursor-pointer hover:bg-neutral-400 dark:hover:bg-neutral-600"
                          onMouseDown={() => handleSelectCountry(country)}
                        >
                          {country.countryName}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-neutral-400">No countries found</li>
                    )}
                  </ul>
                )}
                {validationErrors.country && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.country}</p>
                )}
              </div>
              {/* Business Types */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-black dark:text-neutral-200 mb-2">
                  Business Types <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 cursor-pointer">
                  {[
                    "Customer",
                    "Handling Agent",
                    "Shipper",
                    "Land Transport",
                    "Carrier",
                    "Depot Terminal",
                    "Consignee",
                    "Surveyor",
                    "Lessor",
                    "CY Terminal"
                  ].map((type) => (
                    <label
                      key={type}
                      className="flex items-center text-black dark:text-neutral-200 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={businessTypes.includes(type)}
                        onCheckedChange={() => handleBusinessTypeChange(type)}
                        className="mr-2 border-neutral-500 focus:ring-blue-500"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.businessTypes && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.businessTypes}</p>
                )}
              </div>
            </div>
            {/* Bank Accounts Section */}
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">Bank Accounts</h3>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowBankAccounts(!showBankAccounts)}
                  className="text-blue-400 hover:text-blue-600 text-sm cursor-pointer"
                >
                  {showBankAccounts ? "Hide" : "Show"}
                </Button>
              </div>
              {showBankAccounts && (
                <>
                  {bankAccounts.map((account, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mb-4 relative bg-white dark:bg-neutral-900"
                    >
                      <h4 className="col-span-2 text-md font-semibold text-black dark:text-neutral-200 mb-2">
                        Bank Account #{index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBankAccount(index)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 cursor-pointer"
                      >
                        Remove
                      </Button>
                      {/* Use the same label/input style as the main form */}
                      { [
                        { label: "Account No.", id: "accountNo" },
                        { label: "Bank Name", id: "bankName" },
                        { label: "Address", id: "address", isFull: true },
                        { label: "USCI", id: "usci" },
                        { label: "Branch Name", id: "branchName" },
                        { label: "Branch Code", id: "branchCode" },
                        { label: "Swift Code", id: "swiftCode" },
                        { label: "Currency", id: "currency" },
                      ].map((field) => (
                        <div key={field.id} className={field.isFull ? "md:col-span-2" : ""}>
                          <label
                            htmlFor={`${String(field.id)}-${index}`}
                            className="block text-sm font-medium text-black dark:text-neutral-200 mb-1"
                          >
                            {field.label}
                          </label>
                          <Input
                            id={`${String(field.id)}-${index}`}
                            value={bankAccounts[index][field.id] || ""}
                            onChange={(e) => {
                              const updated = [...bankAccounts];
                              updated[index][field.id] = e.target.value;
                              setBankAccounts(updated);
                            }}
                            className="w-full bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addBankAccount}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mt-4 cursor-pointer"
                  >
                    + Add Bank Account
                  </Button>
                </>
              )}
            </div>
            {/* Ports of Business Section */}
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Ports of Business
                </h3>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowPortsOfBusiness(!showPortsOfBusiness)}
                  className="text-blue-400 hover:text-blue-600 text-sm cursor-pointer"
                >
                  {showPortsOfBusiness ? "Hide" : "Show"}
                </Button>
              </div>
              {showPortsOfBusiness && (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {/* Port Type */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">Port Type</label>
                    <div className="flex gap-4">
                      {["Main", "ICD"].map((type) => (
                        <label key={type} className="inline-flex items-center text-black dark:text-white cursor-pointer">
                          <input
                            type="radio"
                            name="portType"
                            value={type}
                            checked={selectedType === type}
                            onChange={() => setSelectedType(type)}
                            className="form-radio h-4 w-4 text-blue-600 bg-neutral-800 border-neutral-700 cursor-pointer"
                          />
                          <span className="ml-2">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="searchPorts" className="block text-sm font-medium text-black dark:text-white mb-1">
                      Search Ports
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        id="searchPorts"
                        placeholder="Search ports by name or code"
                        value={portSearchTerm}
                        onChange={(e) => {
                          setPortSearchTerm(e.target.value);
                          setShowPortSuggestions(true); // Show suggestions when typing
                        }}
                        onFocus={() => {
                          if (portSearchTerm) setShowPortSuggestions(true);
                        }}
                        className="w-full pl-10 pr-10 bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      {portSearchTerm && (
                        <button 
                          type="button"
                          onClick={() => {
                            setPortSearchTerm('');
                            setShowPortSuggestions(false);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                          title="Clear search"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Filtered Ports */}
                  {portSearchTerm && showPortSuggestions && filteredPorts.length > 0 && (
                    <div 
                      className="space-y-2 bg-white dark:bg-neutral-900 p-2 rounded-md border border-neutral-200 dark:border-neutral-800 mt-2 max-h-60 overflow-y-auto"
                      onBlur={() => setShowPortSuggestions(false)}
                    >
                      {filteredPorts.map((port) => (
                        <div
                          key={port.portCode}
                          className={cn(
                            "cursor-pointer p-2 rounded transition-colors",
                            selectedPorts.find((p) => p.portName === port.portName)
                              ? "bg-blue-500 text-white"
                              : "text-black dark:text-white hover:bg-blue-900 hover:text-blue-400"
                          )}
                          onClick={() => {
                            togglePortSelect(port);
                            setShowPortSuggestions(false); // Hide suggestions after selection
                          }}
                        >
                          {port.portName} ({port.portCode})
                        </div>
                      ))}
                    </div>
                  )}
                  {portSearchTerm && filteredPorts.length === 0 && (
                    <div className="text-sm text-neutral-400 mt-2">No matching ports found.</div>
                  )}
                  {/* Selected Ports with Clear All Button */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-black dark:text-white">Selected Ports</label>
                      {selectedPorts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedPorts([])}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="w-full p-2 rounded-lg bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 min-h-[40px] flex flex-wrap gap-2">
                      {selectedPorts.length > 0
                        ? selectedPorts.map((p) => (
                          <span
                            key={p.portCode}
                            className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs flex items-center gap-1"
                          >
                            {p.portName}
                            <button
                              type="button"
                              onClick={() => togglePortSelect(p)}
                              className="ml-1 hover:text-red-200 focus:outline-none"
                              title="Remove this port"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                        : "No ports selected"}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Contacts Section */}
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h3 className="text-lg font-semibold text-black dark:text-white">Contacts</h3>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowContacts(!showContacts)}
                  className="text-blue-400 hover:text-blue-600 text-sm cursor-pointer"
                >
                  {showContacts ? "Hide" : "Show"}
                </Button>
              </div>
              {showContacts && (
                <>
                  {contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mb-4 relative bg-white dark:bg-neutral-900"
                    >
                      <h4 className="col-span-2 text-md font-semibold text-neutral-200 mb-2">
                        Contact #{index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(index)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 cursor-pointer"
                      >
                        Remove
                      </Button>
                      { [
                        { label: "Title", id: "title" },
                        { label: "First Name", id: "firstName" },
                        { label: "Last Name", id: "lastName" },
                        { label: "Designation", id: "designation" },
                        { label: "Department", id: "department" },
                        { label: "Email", id: "email" },
                        { label: "Landline No", id: "landline" },
                        { label: "Mobile No", id: "mobile" },
                      ].map((field) => (
                        <div key={field.id}>
                        <label
                          htmlFor={`contact-${field.id}-${index}`}
                          className="block text-sm font-medium text-black dark:text-neutral-200 mb-1"
                        >
                          {field.label}
                        </label>
                        <Input
                          id={`contact-${field.id}-${index}`}
                          value={contacts[index][field.id] || ""}
                          onChange={(e) => {
                            const updated = [...contacts];
                            updated[index][field.id] = e.target.value;
                            setContacts(updated);
                          }}
                          className="w-full bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        </div>
                      ))}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addContact}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mt-4 cursor-pointer"
                  >
                    + Add Contact
                  </Button>
                </>
              )}
            </div>
            <DialogFooter className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-center gap-2 bg-white dark:bg-neutral-900">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-black dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg cursor-pointer"
              >
                {editData ? "Update" : "Add Company"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default AddCompanyForm;