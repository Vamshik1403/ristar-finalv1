"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileSpreadsheet, Upload } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Papa from "papaparse";
import axios from "axios";

// Supported import categories
type ImportCategory = "companies" | "ports" | "containers";

// Import status type
type ImportStatus = "idle" | "processing" | "success" | "error";

// Empty CSV template headers for companies
const companyCSVHeaders = [
  "Company Name",
  "Business Type",
  "Address",  
  "Phone",
  "Email",
  "Website",
  "Credit Terms",
  "Credit Limit",
  "remarks",
  "Country",
  "Ports of Business",
  "Status"
];

// Empty CSV template headers for ports based on screenshot
const portCSVHeaders = [
  "PORT_Code",
  "PORT_Name",
  "PORT_LONG",
  "Country -Full",
  "Country -short",
  "Port Type",
  "Parent Port"
];

// Container CSV headers - arranged according to form layout and fixed naming
const containerCSVHeaders = [
  "ID",
  "Container Number",
  "Container Category", 
  "Container Type",
  "Container Size",
  "Container Class",
  "Capacity",
  "Container Unit", // Moved after Capacity to match form arrangement
  "Manufacturer",
  "Build Year",
  "Gross Wt",
  "Tare Wt",
  "Initial Survey Date", // Added missing field that appears in form after Tare Wt
  "Ownership",
  "Lease Ref No", // Renamed from "LEASE REF"
  "Lessor Name", // Moved next to Lease Ref No
  "On-Hire Date",
  "Onhire Location",
  "On Hire DEPOT",
  "Off-Hire Date",
  "Lease Rent Per Day",
  "remarks",
  "Last Inspection Date",
  "Inspection Type",
  "Next Inspection Due Date", // Renamed from "Next Inspection Due"
  "Certificate",
  "Report Date",
  "Report Document"
];

// Simple file upload component
const FileUploadArea = ({
  onFileChange,
  selectedFile,
  isUploading
}: {
  onFileChange: (file: File | null) => void;
  selectedFile: File | null;
  isUploading: boolean;
}) => {
  return (
    <div className="border border-dashed rounded-md p-4 text-center border-gray-300 mt-4">
      {!selectedFile ? (
        <div>
          <FileSpreadsheet className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-black-500">
            Select your filled CSV file to import
          </p>
          <input
            type="file"
            accept=".csv"
            id="file-upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileChange(file);
            }}
            disabled={isUploading}
          />
          <div className="mt-3">
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              Select CSV File
            </label>
          </div>
        </div>
      ) : (
        <div className="py-2">
          <FileSpreadsheet className="mx-auto h-6 w-6 text-green-500 mb-2" />
          <p className="font-medium text-black-800">{selectedFile.name}</p>
          <p className="text-xs text-black-500 mt-1">
            {`${(selectedFile.size / 1024).toFixed(2)} KB`}
          </p>
          <button 
            onClick={() => onFileChange(null)} 
            className="text-xs text-red-500 underline mt-2 hover:text-red-700 cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

// Main DataImportTable component
const DataImportTable = () => {
  const [selectedCategory, setSelectedCategory] = useState<ImportCategory>("companies");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle downloading empty template CSV with just headers
  const handleDownloadEmptyTemplate = () => {
    setIsDownloading(true);
    
    setTimeout(() => {
      if (selectedCategory === "companies") {
        // Create an empty template with just the headers
        const csv = Papa.unparse({
          fields: companyCSVHeaders,
          data: []
        });
        
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "company_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Template downloaded successfully");
      } else if (selectedCategory === "ports") {
        // Create an empty template for ports with just the headers
        const csv = Papa.unparse({
          fields: portCSVHeaders,
          data: []
        });
        
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "port_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Port template downloaded successfully");
      } else if (selectedCategory === "containers") {
        // Create an empty template for containers with just the headers
        const csv = Papa.unparse({
          fields: containerCSVHeaders,
          data: []
        });
        
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "container_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Container template downloaded successfully");
      } else {
        toast.error(`Template download for ${selectedCategory} is not yet available.`);
      }
      setIsDownloading(false);
    }, 300);
  };

  // Map CSV header to API field
  const mapHeaderToField = (header: string) => {
    const fieldMap: Record<string, string> = {
      "Company Name": "companyName",
      "Business Type": "businessType",
      "Address": "address",
      "Phone": "phone",
      "Email": "email",
      "Website": "website",
      "Credit Terms": "creditTerms",
      "Credit Limit": "creditLimit",
      "remarks": "remarks",
      "Country": "countryName", // This will be mapped to countryId later
      "Ports of Business": "portsOfBusiness", // This will be mapped to businessPorts later
      "Status": "status"
    };
    
    return fieldMap[header] || header;
  };

  // Validate a single row of CSV data
  const validateCompanyRow = (row: Record<string, string>): string | null => {
    // Required fields for company import
    const requiredFields = ["Company Name", "Country"];
    
    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === "") {
        return `Missing required field: ${field}`;
      }
    }
    
    // Validate email format if provided
    if (row["Email"] && !/^\S+@\S+\.\S+$/.test(row["Email"])) {
      return "Invalid email format";
    }
    
    // Just make sure website isn't too long - accept any format
    if (row["Website"] && row["Website"].trim().length > 500) {
      return "Website URL is too long (max 500 characters)";
    }
    
    return null; // No validation errors
  };

  // Map port CSV header to API field
  const mapPortHeaderToField = (header: string) => {
    const portFieldMap: Record<string, string> = {
      "PORT_Code": "portCode",
      "PORT_Name": "portName",
      "PORT_LONG": "portLongName",
      "Country -Full": "countryName", // This will be mapped to countryId later
      "Country -short": "countryCode", // This will be used for reference/validation
      "Port Type": "portType",
      "Parent Port": "parentPortName" // This will be mapped to parentPortId later
    };
    
    return portFieldMap[header] || header;
  };

  // Validate a single row of port CSV data
  const validatePortRow = (row: Record<string, string>): string | null => {
    // Required fields for port import
    const requiredFields = ["PORT_Code", "PORT_Name", "PORT_LONG", "Country -Full", "Port Type"];
    
    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === "") {
        return `Missing required field: ${field}`;
      }
    }
    
    // Validate port type is valid - case insensitive comparison
    const portType = row["Port Type"].trim().toUpperCase();
    if (portType !== "MAIN" && portType !== "ICD") {
      return `Invalid Port Type: ${row["Port Type"]}. Must be either "Main" or "ICD"`;
    }
    
    // If port type is ICD, parent port is required
    if (portType === "ICD" && (!row["Parent Port"] || row["Parent Port"].trim() === "")) {
      return "Parent Port is required for ICD port types";
    }
    
    return null; // No validation errors
  };

  // Map container CSV header to API field based on Excel template headers
  const mapContainerHeaderToField = (header: string) => {
    const containerFieldMap: Record<string, string> = {
      "ID": "id",
      "Container Number": "containerNumber",
      "Container Category": "containerCategory",
      "Container Type": "containerType",
      "Container Size": "containerSize",
      "Container Class": "containerClass",
      "Capacity": "containerCapacity",
      "Container Unit": "capacityUnit", // Container Unit mapping
      "Manufacturer": "manufacturer",
      "Build Year": "buildYear",
      "Gross Wt": "grossWt",
      "Tare Wt": "tareWt",
      "Initial Survey Date": "initialSurveyDate", // Added missing Initial Survey Date mapping
      "Gross Weight": "grossWt", // Keep for backward compatibility
      "Tare Weight": "tareWt", // Keep for backward compatibility
      "Ownership": "ownership",
      "Lease Ref No": "leasingRefNo", // Updated from "LEASE REF"
      "LEASE REF": "leasingRefNo", // Keep for backward compatibility
      "Lessor Name": "lessorName",
      "On-Hire Date": "onHireDate",
      "Onhire Location": "onHireLocation",
      "On Hire DEPOT": "onHireDepotId",
      "Off-Hire Date": "offHireDate",
      "Lease Rent Per Day": "leaseRentPerDay",
      "remarks": "remarks",
      "Last Inspection Date": "inspectionDate",
      "Inspection Type": "inspectionType",
      "Next Inspection Due Date": "nextDueDate", // Updated from "Next Inspection Due"
      "Next Inspection Due": "nextDueDate", // Keep for backward compatibility
      "Certificate": "certificate",
      "Report Date": "reportDate",
      "Report Document": "reportDocument"
    };
    
    return containerFieldMap[header] || header;
  };

  // Validate a single row of container CSV data
  const validateContainerRow = (row: Record<string, string>): string | null => {
    // MANDATORY fields for container import - all fields except periodic certificates and onhire reports
    const requiredFields = [
      "Container Number",
      "Container Category", 
      "Container Type",
      "Container Size",
      "Container Class",
      "Capacity",
      "Container Unit",   // Required Container Unit field
      "Manufacturer",
      "Build Year",
      "Gross Wt",
      "Tare Wt",
      "Initial Survey Date", // Added missing Initial Survey Date as required
      "Ownership",
      "On-Hire Date",
      "Onhire Location", // Port (ID or Name)
      "On Hire DEPOT"    // Depot (ID or Name)
    ];
    
    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === "") {
        return `Missing required field: ${field}`;
      }
    }
    
    // Validate container number format
    const containerNumber = row["Container Number"].trim();
    if (containerNumber.length < 3) {
      return `Invalid container number: ${containerNumber}. Must be at least 3 characters.`;
    }
    
    // Validate container category
    const category = row["Container Category"].trim();
    if (!["Tank", "Dry", "Refrigerated"].includes(category)) {
      return `Invalid Container Category: ${category}. Must be "Tank", "Dry", or "Refrigerated"`;
    }
    
    // Validate container size
    const size = row["Container Size"].trim();
    if (!size) {
      return `Container Size is required`;
    }
    
    // Validate capacity
    const capacity = row["Capacity"].trim();
    if (!capacity || isNaN(Number(capacity))) {
      return `Invalid Capacity: ${capacity}. Must be a valid number`;
    }
    
    // Validate weights
    const grossWt = row["Gross Wt"].trim();
    const tareWt = row["Tare Wt"].trim();
    
    if (grossWt && isNaN(Number(grossWt))) {
      return `Invalid Gross Weight: ${grossWt}. Must be a valid number`;
    }
    
    if (tareWt && isNaN(Number(tareWt))) {
      return `Invalid Tare Weight: ${tareWt}. Must be a valid number`;
    }
    
    // Validate build year
    const buildYear = row["Build Year"].trim();
    if (buildYear && (isNaN(Number(buildYear)) || Number(buildYear) < 1900 || Number(buildYear) > new Date().getFullYear() + 1)) {
      return `Invalid Build Year: ${buildYear}. Must be a valid year between 1900 and ${new Date().getFullYear() + 1}`;
    }
    
    // Validate ownership type - REQUIRED field (only "Own" or "Lease" allowed)
    const ownership = row["Ownership"]?.trim();
    if (!ownership) {
      return `Ownership is required for container ${containerNumber}`;
    }
    const ownershipUpper = ownership.toUpperCase();
    if (ownershipUpper !== "OWN" && ownershipUpper !== "LEASE") {
      return `Invalid Ownership: ${ownership}. Must be either "Own" or "Lease" (case insensitive)`;
    }
    
    // Additional validation for LEASE containers - Lessor Name field is MANDATORY
    if (ownershipUpper === "LEASE") {
      if (!row["Lessor Name"] || row["Lessor Name"].trim() === "") {
        return `Lessor Name field is required for Lease container ${containerNumber}`;
      }
    }
    
    // Validate date formats using enhanced timezone-safe date parser
    if (row["On-Hire Date"] && row["On-Hire Date"].trim() !== "") {
      const onHireDate = parseFlexibleDate(row["On-Hire Date"]);
      if (!onHireDate) {
        return `Invalid On-Hire Date format: "${row["On-Hire Date"]}". Preferred format: DD-MM-YYYY (e.g., 25-12-2023). Also accepts: YYYY-MM-DD, DD/MM/YYYY`;
      }
    }
    
    if (row["Initial Survey Date"] && row["Initial Survey Date"].trim() !== "") {
      const initialSurveyDate = parseFlexibleDate(row["Initial Survey Date"]);
      if (!initialSurveyDate) {
        return `Invalid Initial Survey Date format: "${row["Initial Survey Date"]}". Preferred format: DD-MM-YYYY (e.g., 25-12-2023). Also accepts: YYYY-MM-DD, DD/MM/YYYY`;
      }
    }
    
    if (row["Off-Hire Date"] && row["Off-Hire Date"].trim() !== "") {
      const offHireDate = parseFlexibleDate(row["Off-Hire Date"]);
      if (!offHireDate) {
        return `Invalid Off-Hire Date format: "${row["Off-Hire Date"]}". Preferred format: DD-MM-YYYY (e.g., 25-12-2023). Also accepts: YYYY-MM-DD, DD/MM/YYYY`;
      }
    }
    
    if (row["Last Inspection Date"] && row["Last Inspection Date"].trim() !== "") {
      const lastInspectionDate = parseFlexibleDate(row["Last Inspection Date"]);
      if (!lastInspectionDate) {
        return `Invalid Last Inspection Date format: "${row["Last Inspection Date"]}". Preferred format: DD-MM-YYYY (e.g., 25-12-2023). Also accepts: YYYY-MM-DD, DD/MM/YYYY`;
      }
    }
    
    if (row["Next Inspection Due Date"] && row["Next Inspection Due Date"].trim() !== "") {
      const nextInspectionDate = parseFlexibleDate(row["Next Inspection Due Date"]);
      if (!nextInspectionDate) {
        return `Invalid Next Inspection Due Date format: "${row["Next Inspection Due Date"]}". Preferred format: DD-MM-YYYY (e.g., 25-12-2023). Also accepts: YYYY-MM-DD, DD/MM/YYYY`;
      }
    }
    
    if (row["Report Date"] && row["Report Date"].trim() !== "") {
      const reportDate = parseFlexibleDate(row["Report Date"]);
      if (!reportDate) {
        return `Invalid Report Date format: "${row["Report Date"]}". Preferred format: DD-MM-YYYY (e.g., 25-12-2023). Also accepts: YYYY-MM-DD, DD/MM/YYYY`;
      }
    }
    
    return null;
  };

  // Process and upload the CSV file
  const handleProcessCSV = async () => {
    if (!selectedFile) return;
    
    if (selectedCategory !== "companies" && selectedCategory !== "ports" && selectedCategory !== "containers") {
      toast.error(`Import for ${selectedCategory} is not yet available.`);
      return;
    }

    setImportStatus("processing");
    setImportStats({ success: 0, failed: 0 });
    setErrorMessages([]);
    
    // Parse the CSV file
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.errors.length > 0) {
          setImportStatus("error");
          setErrorMessages(results.errors.map(err => `CSV parsing error: ${err.message} at row ${err.row}`));
          return;
        }
        
        const data = results.data as Record<string, string>[];
        
        // Check if the CSV is empty
        if (data.length === 0) {
          setImportStatus("error");
          setErrorMessages(["The CSV file is empty or contains no valid data"]);
          return;
        }

        if (selectedCategory === "companies") {
          await processCompanyImport(data);
        } else if (selectedCategory === "ports") {
          await processPortImport(data);
        } else if (selectedCategory === "containers") {
          await processContainerImport(data);
        }
      },
      error: (error) => {
        setImportStatus("error");
        setErrorMessages([`Failed to parse CSV: ${error.message}`]);
      }
    });
  };

  // Process company import data
  const processCompanyImport = async (data: Record<string, string>[]) => {
    // Check if the CSV has the required headers
    const requiredHeaders = ["Company Name", "Country"];
    const headers = Object.keys(data[0]);
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      setImportStatus("error");
      setErrorMessages([`Missing required headers: ${missingHeaders.join(", ")}`]);
      return;
    }
    
    // Pre-validate ALL rows to catch all errors upfront
    console.log(`Pre-validating ${data.length} companies to catch all errors...`);
    const validationErrors: string[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because Excel starts at row 1 and has headers
      
      // Validate the row structure and data
      const validationError = validateCompanyRow(row);
      if (validationError) {
        validationErrors.push(`Row ${rowNumber} (${row["Company Name"] || "Unknown"}): ${validationError}`);
      }
    }
    
    // If there are validation errors, show them all and stop
    if (validationErrors.length > 0) {
      setImportStatus("error");
      setErrorMessages(validationErrors);
      setImportStats({ success: 0, failed: validationErrors.length });
      return;
    }
    
    const successCount = { value: 0 };
    const failedCount = { value: 0 };
    const errors: string[] = [];
    
    try {
      // Fetch all countries to map country names to IDs
      const countriesResponse = await axios.get("http://localhost:8000/country");
      const countries = countriesResponse.data;
      
      // Fetch all ports to map port names to IDs
      const portsResponse = await axios.get("http://localhost:8000/ports");
      const ports = portsResponse.data;
      
      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Validate the row
          const validationError = validateCompanyRow(row);
          if (validationError) {
            throw new Error(validationError);
          }
          
          // Create a payload for the addressbook API
          const payload: Record<string, any> = {
            refId: "", // Will be auto-generated by the backend
            bankDetails: [],
            businessPorts: [],
            contacts: []
          };
          
          // Define predefined business types (exact case as in form)
          const predefinedBusinessTypes = [
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
          ];

          // Map each CSV field to its API equivalent
          Object.keys(row).forEach(header => {
            if (row[header] && row[header].trim() !== "") {
              const field = mapHeaderToField(header);
              if (field !== header) { // if we have a mapping
                // Special handling for businessType
                if (field === "businessType") {
                  // Split on comma, trim each, and match case-insensitively
                  const csvBusinessTypes = row[header]
                    .split(/\s*,\s*/)
                    .map((s: string) => s.trim())
                    .filter(Boolean);
                  
                  const matchedTypes: string[] = [];
                  const unmatchedTypes: string[] = [];
                  
                  csvBusinessTypes.forEach(csvType => {
                    // Find matching predefined type (case-insensitive)
                    const matchedType = predefinedBusinessTypes.find(
                      predefinedType => predefinedType.toLowerCase() === csvType.toLowerCase()
                    );
                    
                    if (matchedType) {
                      matchedTypes.push(matchedType);
                    } else {
                      unmatchedTypes.push(csvType);
                    }
                  });
                  
                  // If there are unmatched types, throw an error
                  if (unmatchedTypes.length > 0) {
                    throw new Error(`Invalid business types: ${unmatchedTypes.join(", ")}. Valid options are: ${predefinedBusinessTypes.join(", ")}`);
                  }
                  
                  // Join matched types with proper case
                  payload[field] = matchedTypes.join(", ");
                } else {
                  payload[field] = row[header].trim();
                }
              }
            }
          });
          
          // Set default status if not provided
          if (!payload.status) {
            payload.status = "Active";
          }
          
          // Convert credit limit to string
          if (payload.creditLimit) {
            // Handle any format and convert to a simple string
            const cleanedLimit = payload.creditLimit.replace(/[^0-9.]/g, '');
            payload.creditLimit = cleanedLimit || "0";
          } else {
            payload.creditLimit = "0";
          }
          
          // Map country name to country ID
          if (payload.countryName) {
            // Case-insensitive search with trimming
            const country = countries.find(
              (c: any) => c.countryName.toLowerCase().trim() === payload.countryName.toLowerCase().trim()
            );
            
            if (country) {
              payload.countryId = country.id;
              delete payload.countryName;
            } else {
              throw new Error(`Country not found: ${payload.countryName}. Please check the country name matches exactly with a country in the system.`);
            }
          } else {
            throw new Error(`Country is required and was not provided.`);
          }
          
          // Map ports of business to port IDs
          if (payload.portsOfBusiness) {
            // Split on comma, trim each, and filter out empty strings
            const portNames = payload.portsOfBusiness
              .split(/\s*,\s*/)
              .map((s: string) => s.trim())
              .filter(Boolean);
            
            const businessPorts: any[] = [];
            const notFoundPorts: string[] = [];
            
            for (const portName of portNames) {
              // Case-insensitive search for port by name
              const port = ports.find(
                (p: any) => p.portName.toLowerCase().trim() === portName.toLowerCase().trim()
              );
              
              if (port) {
                businessPorts.push({ portId: port.id });
              } else {
                notFoundPorts.push(portName);
              }
            }
            
            if (notFoundPorts.length > 0) {
              throw new Error(`Ports not found: ${notFoundPorts.join(", ")}. Please check the port names match exactly with ports in the system.`);
            }
            
            payload.businessPorts = businessPorts;
            delete payload.portsOfBusiness;
          }
          
          // Case-insensitive uniqueness check for company name before submission
          const existingCompaniesResponse = await axios.get("http://localhost:8000/addressbook");
          const existingCompanies = existingCompaniesResponse.data;
          
          const duplicateCompany = existingCompanies.find((company: any) => 
            company.companyName.toLowerCase() === payload.companyName.toLowerCase()
          );
          
          if (duplicateCompany) {
            throw new Error(`Company with name "${payload.companyName}" already exists match with "${duplicateCompany.companyName}")`);
          }

          // Submit to API
          await axios.post("http://localhost:8000/addressbook", payload);
          successCount.value++;
        } catch (error: any) {
          failedCount.value++;
          const errorMessage = error.response?.data?.message || error.message || "Unknown error";
          const detailedError = error.response?.data?.error || "";
          const fullErrorMessage = detailedError 
            ? `${errorMessage} - Details: ${detailedError}` 
            : errorMessage;
          errors.push(`Row ${i+1} (Company: ${row["Company Name"] || "Unknown"}): ${fullErrorMessage}`);
          console.error(`Company import error for row ${i+1}:`, error);
        }
      }
      
      // Update statistics
      setImportStats({ 
        success: successCount.value, 
        failed: failedCount.value 
      });
      setErrorMessages(errors);
      
      if (errors.length > 0 && successCount.value === 0) {
        setImportStatus("error");
      } else if (errors.length > 0) {
        setImportStatus("success"); // Partial success
        toast.success(`${successCount.value} companies imported with ${errors.length} errors`);
      } else {
        setImportStatus("success");
        toast.success(`${successCount.value} companies imported successfully`);
      }
    } catch (error: any) {
      setImportStatus("error");
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      const detailedError = error.response?.data?.error || "";
      const fullErrorMessage = detailedError 
        ? `${errorMessage} - Details: ${detailedError}` 
        : errorMessage;
      setErrorMessages([`General company import error: ${fullErrorMessage}`]);
      console.error("Company import general error:", error);
    }
  };

  // Process port import data
  const processPortImport = async (data: Record<string, string>[]) => {
    // Check if the CSV has the required headers
    const requiredHeaders = ["PORT_Code", "PORT_Name", "PORT_LONG", "Country -Full", "Port Type"];
    const headers = Object.keys(data[0]);
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      setImportStatus("error");
      setErrorMessages([`Missing required headers: ${missingHeaders.join(", ")}`]);
      return;
    }
    
    // Pre-validate ALL rows to catch all errors upfront
    console.log(`Pre-validating ${data.length} ports to catch all errors...`);
    const validationErrors: string[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because Excel starts at row 1 and has headers
      
      // Validate the row structure and data
      const validationError = validatePortRow(row);
      if (validationError) {
        validationErrors.push(`Row ${rowNumber} (${row["PORT_Name"] || "Unknown"}): ${validationError}`);
      }
    }
    
    // If there are validation errors, show them all and stop
    if (validationErrors.length > 0) {
      setImportStatus("error");
      setErrorMessages(validationErrors);
      setImportStats({ success: 0, failed: validationErrors.length });
      return;
    }
    
    const successCount = { value: 0 };
    const failedCount = { value: 0 };
    const errors: string[] = [];
    
    try {
      // Fetch all countries to map country names to IDs
      const countriesResponse = await axios.get("http://localhost:8000/country");
      const countries = countriesResponse.data;
      
      // Fetch all ports to map parent port names to IDs
      const portsResponse = await axios.get("http://localhost:8000/ports");
      const ports = portsResponse.data;
      
      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Validate the row
          const validationError = validatePortRow(row);
          if (validationError) {
            throw new Error(validationError);
          }
          
          // Create a payload for the ports API
          const payload: Record<string, any> = {
            status: "Active" // Default status
          };
          
          // Map each CSV field to its API equivalent
          Object.keys(row).forEach(header => {
            if (row[header] && row[header].trim() !== "") {
              const field = mapPortHeaderToField(header);
              if (field !== header) { // if we have a mapping
                payload[field] = row[header].trim();
              }
            }
          });
          
          // Map country name to country ID
          if (payload.countryName) {
            // Case-insensitive search with trimming
            const country = countries.find(
              (c: any) => c.countryName.toLowerCase().trim() === payload.countryName.toLowerCase().trim()
            );
            
            if (country) {
              payload.countryId = country.id;
              payload.currencyId = country.currencyId; // Get currency ID from the country
              delete payload.countryName;
              delete payload.countryCode; // We don't need this in the payload
            } else {
              throw new Error(`Country not found: ${payload.countryName}. Please check the country name matches exactly with a country in the system.`);
            }
          } else {
            throw new Error(`Country is required and was not provided.`);
          }
          
          // Normalize port type to match expected format
          if (payload.portType) {
            // Convert to title case for consistent format (e.g., "MAIN" → "Main", "icd" → "ICD")
            if (payload.portType.toUpperCase() === "MAIN") {
              payload.portType = "Main";
            } else if (payload.portType.toUpperCase() === "ICD") {
              payload.portType = "ICD";
            }
          }
          
          // Map parent port name to parent port ID if provided
          if (payload.parentPortName && payload.portType === "ICD") {
            // Try to find port by exact name or code
            let parentPort = ports.find(
              (p: any) => p.portName.toLowerCase().trim() === payload.parentPortName.toLowerCase().trim() ||
                          p.portCode.toLowerCase().trim() === payload.parentPortName.toLowerCase().trim()
            );
            
            if (parentPort) {
              payload.parentPortId = parentPort.id;
              delete payload.parentPortName;
            } else {
              throw new Error(`Parent Port not found: ${payload.parentPortName}. Please check the port name or code matches exactly with a port in the system.`);
            }
          }
          
          delete payload.parentPortName; // Remove this field even if not used
          
          // Case-insensitive uniqueness check for port name before submission
          const existingPortsResponse = await axios.get("http://localhost:8000/ports");
          const existingPorts = existingPortsResponse.data;
          
          const duplicatePort = existingPorts.find((port: any) => 
            port.portName.toLowerCase() === payload.portName.toLowerCase()
          );
          
          if (duplicatePort) {
            throw new Error(`Port with name "${payload.portName}" already exists match with "${duplicatePort.portName}")`);
          }
          
          // Submit to API
          await axios.post("http://localhost:8000/ports", payload);
          successCount.value++;
        } catch (error: any) {
          failedCount.value++;
          const errorMessage = error.response?.data?.message || error.message || "Unknown error";
          const detailedError = error.response?.data?.error || "";
          const fullErrorMessage = detailedError 
            ? `${errorMessage} - Details: ${detailedError}` 
            : errorMessage;
          errors.push(`Row ${i+1} (Port: ${row["PORT_Name"] || "Unknown"}): ${fullErrorMessage}`);
          console.error(`Port import error for row ${i+1}:`, error);
        }
      }
      
      // Update statistics
      setImportStats({ 
        success: successCount.value, 
        failed: failedCount.value 
      });
      setErrorMessages(errors);
      
      if (errors.length > 0 && successCount.value === 0) {
        setImportStatus("error");
      } else if (errors.length > 0) {
        setImportStatus("success"); // Partial success
        toast.success(`${successCount.value} ports imported with ${errors.length} errors`);
      } else {
        setImportStatus("success");
        toast.success(`${successCount.value} ports imported successfully`);
      }
    } catch (error: any) {
      setImportStatus("error");
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      const detailedError = error.response?.data?.error || "";
      const fullErrorMessage = detailedError 
        ? `${errorMessage} - Details: ${detailedError}` 
        : errorMessage;
      setErrorMessages([`General port import error: ${fullErrorMessage}`]);
      console.error("Port import general error:", error);
    }
  };

  // Enhanced date parsing function with timezone-safe processing
  const parseFlexibleDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.trim() === "") return null;
    
    const trimmed = dateStr.trim();
    
    // Try manual parsing for DD-MM-YYYY format (most common in your system)
    const ddmmyyyy = trimmed.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (ddmmyyyy) {
      const day = parseInt(ddmmyyyy[1]);
      const month = parseInt(ddmmyyyy[2]);
      const year = parseInt(ddmmyyyy[3]);
      
      // Create date as local date without timezone conversion
      // This ensures the date stays exactly as entered
      const date = new Date(year, month - 1, day, 12, 0, 0, 0); // Set to noon to avoid timezone issues
      if (!isNaN(date.getTime()) && date.getFullYear() === year) {
        return date;
      }
    }
    
    // Try manual parsing for YYYY-MM-DD format
    const yyyymmdd = trimmed.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if (yyyymmdd) {
      const year = parseInt(yyyymmdd[1]);
      const month = parseInt(yyyymmdd[2]);
      const day = parseInt(yyyymmdd[3]);
      
      const date = new Date(year, month - 1, day, 12, 0, 0, 0); // Set to noon to avoid timezone issues
      if (!isNaN(date.getTime()) && date.getFullYear() === year) {
        return date;
      }
    }
    
    // Try MM-DD-YYYY format as fallback
    const mmddyyyy = trimmed.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (mmddyyyy) {
      const month = parseInt(mmddyyyy[1]);
      const day = parseInt(mmddyyyy[2]);
      const year = parseInt(mmddyyyy[3]);
      
      // Only use this format if month > 12 or day makes sense as month
      if (month <= 12 && day <= 31) {
        const date = new Date(year, month - 1, day, 12, 0, 0, 0);
        if (!isNaN(date.getTime()) && date.getFullYear() === year) {
          return date;
        }
      }
    }
    
    // Try ISO date as last resort
    try {
      const isoDate = new Date(trimmed);
      if (!isNaN(isoDate.getTime()) && isoDate.getFullYear() > 1900) {
        // Convert to local date to avoid timezone issues
        const localDate = new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate(), 12, 0, 0, 0);
        return localDate;
      }
    } catch (e) {
      // Ignore ISO parsing errors
    }
    
    return null; // Could not parse
  };

  // Format date consistently as DD-MM-YYYY for display and storage
  const formatDateToDDMMYYYY = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return "";
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  // Create timezone-safe ISO string for storage (stores as local date, not UTC)
  const createLocalDateISO = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return "";
    
    // Create proper ISO string with timezone information
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Return full ISO-8601 DateTime format as expected by Prisma
    return `${year}-${month}-${day}T12:00:00.000Z`;
  };

  // Create date string for form inputs (YYYY-MM-DD format)
  const createDateInputString = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Enhanced lookup functions for container import - Handle both IDs and Names
  const findPortByIdOrName = (portsData: any[], value: string): any | null => {
    if (!value || value.trim() === "") return null;
    
    const trimmedValue = value.trim();
    
    // First try to find by ID (if value is a number)
    if (!isNaN(Number(trimmedValue))) {
      const portById = portsData.find((p: any) => p.id === Number(trimmedValue));
      if (portById) return portById;
    }
    
    // Then try to find by port name (case insensitive)
    const portByName = portsData.find(
      (p: any) => p.portName.toLowerCase().trim() === trimmedValue.toLowerCase()
    );
    if (portByName) return portByName;
    
    // Finally try to find by port code (case insensitive)
    const portByCode = portsData.find(
      (p: any) => p.portCode.toLowerCase().trim() === trimmedValue.toLowerCase()
    );
    
    return portByCode || null;
  };

  const findDepotByIdOrName = (addressBookData: any[], value: string): any | null => {
    if (!value || value.trim() === "") return null;
    
    const trimmedValue = value.trim();
    
    // First try to find by ID (if value is a number)
    if (!isNaN(Number(trimmedValue))) {
      const depotById = addressBookData.find((a: any) => a.id === Number(trimmedValue));
      if (depotById) return depotById;
    }
    
    // Then try to find by company name (case insensitive)
    // Filter for companies that have "Depot" or "Terminal" in business type
    const depotByName = addressBookData.find((a: any) => {
      const nameMatches = a.companyName.toLowerCase().trim() === trimmedValue.toLowerCase();
      const isDepotType = a.businessType && 
        (a.businessType.toLowerCase().includes("depot") || 
         a.businessType.toLowerCase().includes("terminal"));
      return nameMatches && isDepotType;
    });
    
    if (depotByName) return depotByName;
    
    // If not found with depot filter, try general name match
    const generalMatch = addressBookData.find(
      (a: any) => a.companyName.toLowerCase().trim() === trimmedValue.toLowerCase()
    );
    
    return generalMatch || null;
  };

  const findLessorByIdOrName = (addressBookData: any[], value: string): any | null => {
    if (!value || value.trim() === "") return null;
    
    const trimmedValue = value.trim();
    
    // First try to find by ID (if value is a number)
    if (!isNaN(Number(trimmedValue))) {
      const lessorById = addressBookData.find((a: any) => a.id === Number(trimmedValue));
      if (lessorById) return lessorById;
    }
    
    // Then try to find by company name (case insensitive)
    // Prefer companies that have "Lessor" or "Owner" in business type
    const lessorByName = addressBookData.find((a: any) => {
      const nameMatches = a.companyName.toLowerCase().trim() === trimmedValue.toLowerCase();
      const isLessorType = a.businessType && 
        (a.businessType.toLowerCase().includes("lessor") || 
         a.businessType.toLowerCase().includes("owner") ||
         a.businessType.toLowerCase().includes("leasing"));
      return nameMatches && isLessorType;
    });
    
    if (lessorByName) return lessorByName;
    
    // If not found with lessor filter, try general name match
    const generalMatch = addressBookData.find(
      (a: any) => a.companyName.toLowerCase().trim() === trimmedValue.toLowerCase()
    );
    
    return generalMatch || null;
  };

  // Process container import data
  const processContainerImport = async (data: Record<string, string>[]) => {
    // Filter out empty rows first
    const nonEmptyData = data.filter(row => {
      // Check if row has at least container number
      return row["Container Number"] && row["Container Number"].trim() !== "";
    });

    if (nonEmptyData.length === 0) {
      setImportStatus("error");
      setErrorMessages(["No valid container data found in the file"]);
      return;
    }

    // Check if the CSV has the required headers based on Excel template headers
    const requiredHeaders = ["Container Number", "Container Category", "Container Type", "Container Class"];
    const headers = Object.keys(data[0]);
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      setImportStatus("error");
      setErrorMessages([`Missing required headers: ${missingHeaders.join(", ")}`]);
      return;
    }
    
    const successCount = { value: 0 };
    const failedCount = { value: 0 };
    const errors: string[] = [];
    const skippedRows: string[] = [];
    
    // Pre-validate ALL rows to catch all errors upfront
    console.log(`Pre-validating ${nonEmptyData.length} containers to catch all errors...`);
    const validationErrors: string[] = [];
    
    for (let i = 0; i < nonEmptyData.length; i++) {
      const row = nonEmptyData[i];
      const rowNumber = i + 2; // +2 because Excel starts at row 1 and has headers
      
      // Skip if container number is empty
      if (!row["Container Number"] || row["Container Number"].trim() === "") {
        validationErrors.push(`Row ${rowNumber}: Empty container number`);
        continue;
      }
      
      // Validate the row structure and data
      const validationError = validateContainerRow(row);
      if (validationError) {
        validationErrors.push(`Row ${rowNumber} (${row["Container Number"] || "Unknown"}): ${validationError}`);
      }
    }
    
    // If there are validation errors, show them all and stop
    if (validationErrors.length > 0) {
      setImportStatus("error");
      setErrorMessages(validationErrors);
      setImportStats({ success: 0, failed: validationErrors.length });
      return;
    }
    
    try {
      // Fetch all address book entries to map names to IDs
      const addressBookResponse = await axios.get("http://localhost:8000/addressbook");
      const addressBookEntries = addressBookResponse.data;
      
      // Fetch all ports to map port names to IDs
      const portsResponse = await axios.get("http://localhost:8000/ports");
      const portsEntries = portsResponse.data;
      
      console.log(`Processing ${nonEmptyData.length} containers...`);
      
      // Process each row
      for (let i = 0; i < nonEmptyData.length; i++) {
        const row = nonEmptyData[i];
        const rowNumber = i + 2; // +2 because Excel starts at row 1 and has headers
        
        try {
          // Skip if container number is empty
          if (!row["Container Number"] || row["Container Number"].trim() === "") {
            skippedRows.push(`Row ${rowNumber}: Empty container number`);
            continue;
          }
          
          // Validate the row
          const validationError = validateContainerRow(row);
          if (validationError) {
            throw new Error(validationError);
          }
          
          // Determine ownership type first - MAKE IT REQUIRED
          const ownershipValue = row["Ownership"]?.trim() || "";
          const ownershipUpper = ownershipValue.toUpperCase();
          
          // Fail fast if ownership is not provided
          if (!ownershipValue) {
            throw new Error(`Ownership is required`);
          }
          
          console.log(`Processing container ${row["Container Number"]} (Row ${rowNumber}) - Ownership: "${ownershipValue}"`);
          
          // Step 1: Create the base inventory payload
          const inventoryPayload: Record<string, any> = {
            containerCategory: row["Container Category"]?.trim() || "Tank",
            status: "Active",
            containerNumber: row["Container Number"].trim(),
            containerType: row["Container Type"]?.trim() || "",
            containerSize: row["Container Size"]?.trim() || "20TK",
            containerClass: row["Container Class"]?.trim() || "",
            containerCapacity: row["Capacity"]?.trim() || "",
            capacityUnit: row["Container Unit"]?.trim().toUpperCase() || "L", // Make Container Unit case insensitive
            manufacturer: row["Manufacturer"]?.trim() || "",
            buildYear: row["Build Year"]?.trim() || "",
            grossWeight: (row["Gross Wt"] && String(row["Gross Wt"]).trim() !== "") ? String(row["Gross Wt"]).trim() : "",
            tareWeight: (row["Tare Wt"] && String(row["Tare Wt"]).trim() !== "") ? String(row["Tare Wt"]).trim() : "",
            InitialSurveyDate: row["Initial Survey Date"] ? createLocalDateISO(parseFlexibleDate(row["Initial Survey Date"]) || new Date()) : "", // Handle Initial Survey Date with timezone-safe processing
            leasingInfo: [],
            periodicTankCertificates: [],
            onHireReport: []
          };
          
          // Handle ownership-specific fields - Only "Own" or "Lease" allowed
          if (ownershipUpper === "OWN") {
            inventoryPayload.ownership = "Own";
            
            // For OWN containers, set port and depot at inventory level
            let portId = null;
            let depotId = null;
            let port = null;
            let depot = null;
            
            // Find port using enhanced lookup - handle both ID and name
            if (row["Onhire Location"] && row["Onhire Location"].trim() !== "") {
              const onHireLocationValue = row["Onhire Location"].trim();
              port = findPortByIdOrName(portsEntries, onHireLocationValue);
              
              if (port) {
                portId = port.id;
                console.log(`✓ Found port: ${port.portName} (ID: ${port.id}) for "${onHireLocationValue}"`);
              } else {
                throw new Error(`Onhire Location "${onHireLocationValue}" not found. Please check the port name, code, or ID exists in the system.`);
              }
            } else {
              throw new Error(`Onhire Location is required for container ${row["Container Number"]}`);
            }
            
            // Find depot using enhanced lookup - handle both ID and name
            if (row["On Hire DEPOT"] && row["On Hire DEPOT"].trim() !== "") {
              const depotValue = row["On Hire DEPOT"].trim();
              depot = findDepotByIdOrName(addressBookEntries, depotValue);
              
              if (depot) {
                depotId = depot.id;
                console.log(`✓ Found depot: ${depot.companyName} (ID: ${depot.id}) for "${depotValue}"`);
              } else {
                throw new Error(`On Hire DEPOT "${depotValue}" not found. Please check the depot name or ID exists in the system with business type containing "Depot" or "Terminal".`);
              }
            } else {
              throw new Error(`On Hire DEPOT is required for container ${row["Container Number"]}`);
            }

            // Create leasing info for OWN containers
            if (portId && depotId) {
              // Parse dates safely using enhanced timezone-safe date parsing
              let onHireDate = createLocalDateISO(new Date());
              if (row["On-Hire Date"] && row["On-Hire Date"].trim() !== "") {
                const parsedDate = parseFlexibleDate(row["On-Hire Date"]);
                if (parsedDate) {
                  onHireDate = createLocalDateISO(parsedDate);
                } else {
                  console.warn(`Invalid date format for On-Hire Date: ${row["On-Hire Date"]}`);
                }
              }
              
              inventoryPayload.leasingInfo.push({
                ownershipType: "Own",
                leasingRefNo: row["Lease Ref No"] || `OWN-${row["Container Number"]}`,
                lessoraddressbookId: depotId,
                onHireDepotaddressbookId: depotId,
                portId: portId,
                onHireDate: onHireDate,
                offHireDate: null,
                leaseRentPerDay: "0",
                remarks: row["remarks"] || ""
              });

              // MOST IMPORTANT: Set these at inventory level for "Own" containers
              // This is what makes it work like the form!
              inventoryPayload.portId = portId;
              inventoryPayload.onHireDepotaddressbookId = depotId;
              
              console.log(`Final inventory payload has port: ${portId} and depot: ${depotId}`);
            }

          } else if (ownershipUpper === "LEASE") {
            // For LEASE containers
            inventoryPayload.ownership = "Lease";
            
            // IMPORTANT: DO NOT set port/depot at inventory level for lease containers
            delete inventoryPayload.portId;
            delete inventoryPayload.onHireDepotaddressbookId;
            
            // Create leasing info record for LEASED containers
            let lessorId = null;
            let portId = null;
            let depotId = null;
            
            // Find lessor from Lessor Name column using enhanced lookup - REQUIRED for lease containers
            if (row["Lessor Name"] && row["Lessor Name"].trim() !== "") {
              const lessorValue = row["Lessor Name"].trim();
              const lessor = findLessorByIdOrName(addressBookEntries, lessorValue);
              
              if (lessor) {
                lessorId = lessor.id;
                console.log(`✓ Found lessor: ${lessor.companyName} (ID: ${lessor.id}) for "${lessorValue}"`);
              } else {
                throw new Error(`Lessor Name "${lessorValue}" not found. Please check the lessor name or ID exists in the system, preferably with business type containing "Lessor", "Owner", or "Leasing".`);
              }
            } else {
                          throw new Error(`Lessor Name is required for Lease container ${row["Container Number"]}`);
          }
            
            // Find port for leasing record using enhanced lookup - handle both ID and name
            if (row["Onhire Location"] && row["Onhire Location"].trim() !== "") {
              const onHireLocationValue = row["Onhire Location"].trim();
              const port = findPortByIdOrName(portsEntries, onHireLocationValue);
              
              if (port) {
                portId = port.id;
                console.log(`✓ Found leased port: ${port.portName} (ID: ${port.id}) for "${onHireLocationValue}"`);
              } else {
                throw new Error(`Onhire Location "${onHireLocationValue}" not found for Lease container. Please check the port name, code, or ID exists in the system.`);
              }
            } else {
              throw new Error(`Onhire Location is required for Lease container ${row["Container Number"]}`);
            }
            
            // Find depot for leasing record using enhanced lookup - handle both ID and name
            if (row["On Hire DEPOT"] && row["On Hire DEPOT"].trim() !== "") {
              const depotValue = row["On Hire DEPOT"].trim();
              const depot = findDepotByIdOrName(addressBookEntries, depotValue);
              
              if (depot) {
                depotId = depot.id;
                console.log(`✓ Found leased depot: ${depot.companyName} (ID: ${depot.id}) for "${depotValue}"`);
              } else {
                throw new Error(`On Hire DEPOT "${depotValue}" not found for Lease container. Please check the depot name or ID exists in the system with business type containing "Depot" or "Terminal".`);
              }
            } else {
              throw new Error(`On Hire DEPOT is required for Lease container ${row["Container Number"]}`);
            }
            
            // All required fields should be found by now, no fallbacks needed since validation is strict
            
            // Create leasing info record - THIS IS CRITICAL FOR LEASE CONTAINERS
            // Since validation is strict, all IDs should be found by now
            if (lessorId && portId && depotId) {
              // Parse dates safely using enhanced timezone-safe date parsing
              let onHireDate = createLocalDateISO(new Date());
              let offHireDate = null;
              
              if (row["On-Hire Date"] && row["On-Hire Date"].trim() !== "") {
                const parsedDate = parseFlexibleDate(row["On-Hire Date"]);
                if (parsedDate) {
                  onHireDate = createLocalDateISO(parsedDate);
                } else {
                  console.warn(`Invalid date format for On-Hire Date: ${row["On-Hire Date"]}`);
                }
              }
              
              if (row["Off-Hire Date"] && row["Off-Hire Date"].trim() !== "") {
                const parsedOffHireDate = parseFlexibleDate(row["Off-Hire Date"]);
                if (parsedOffHireDate) {
                  offHireDate = createLocalDateISO(parsedOffHireDate);
                } else {
                  console.warn(`Invalid date format for Off-Hire Date in row ${rowNumber}: ${row["Off-Hire Date"]}`);
                  // Leave as null if invalid
                }
              }
              
              inventoryPayload.leasingInfo.push({
                ownershipType: "Leased", // Backend expects "Leased" not "Lease"
                leasingRefNo: row["Lease Ref No"] || `LEASE-${row["Container Number"]}`,
                lessoraddressbookId: lessorId,
                onHireDepotaddressbookId: depotId,
                portId: portId,
                onHireDate: onHireDate,
                offHireDate: offHireDate,
                leaseRentPerDay: row["Lease Rent Per Day"] || row["LEASE RENTAL"] || "0",
                remarks: row["remarks"] || ""
              });
            } else {
              throw new Error(`Cannot create leasing info. Missing required references: lessor=${lessorId ? 'found' : 'missing'}, depot=${depotId ? 'found' : 'missing'}, port=${portId ? 'found' : 'missing'}`);
            }
          }
          
          // Add periodic tank certificates if provided with timezone-safe date processing
          if (row["Last Inspection Date"] && row["Inspection Type"] && row["Last Inspection Date"].trim() !== "") {
            const inspectionDate = parseFlexibleDate(row["Last Inspection Date"]);
            const nextDueDate = row["Next Inspection Due Date"] && row["Next Inspection Due Date"].trim() !== "" 
              ? parseFlexibleDate(row["Next Inspection Due Date"])
              : new Date();
              
            if (inspectionDate) {
              inventoryPayload.periodicTankCertificates.push({
                inspectionDate: createLocalDateISO(inspectionDate),
                inspectionType: row["Inspection Type"],
                nextDueDate: createLocalDateISO(nextDueDate || new Date()),
                certificate: row["Certificate"] || ""
              });
            } else {
              console.warn(`Invalid date format for inspection dates in row ${rowNumber}`);
            }
          }
          
          // Add on-hire report if provided with timezone-safe date processing
          if (row["Report Date"] && row["Report Date"].trim() !== "") {
            const reportDate = parseFlexibleDate(row["Report Date"]);
            if (reportDate) {
              inventoryPayload.onHireReport.push({
                reportDate: createLocalDateISO(reportDate),
                reportDocument: row["Report Document"] || ""
              });
            } else {
              console.warn(`Invalid date format for report date in row ${rowNumber}`);
            }
          }

          // Step 2: Case-insensitive uniqueness check for container number before submission
          const existingContainersResponse = await axios.get("http://localhost:8000/inventory");
          const existingContainers = existingContainersResponse.data;
          
          const duplicateContainer = existingContainers.find((container: any) => 
            container.containerNumber.toLowerCase() === inventoryPayload.containerNumber.toLowerCase()
          );
          
          if (duplicateContainer) {
            throw new Error(`Container with number "${inventoryPayload.containerNumber}" already exists match with "${duplicateContainer.containerNumber}")`);
          }

          // Step 3: Submit the complete inventory payload
          try {
            const response = await axios.post("http://localhost:8000/inventory", inventoryPayload);
            console.log(`✓ Successfully created container ${row["Container Number"]} (Row ${rowNumber})`);
            successCount.value++;
            
            // After successfully creating the inventory record for an 'Own' container:
            if (ownershipUpper === 'OWN') {
              // Get portId and depotId from inventoryPayload if available
              const portId = inventoryPayload.portId;
              const depotId = inventoryPayload.onHireDepotaddressbookId;
              // Defensive: If either is missing, skip LeasingInfo post and log error
              if (!portId || !depotId) {
                failedCount.value++;
                errors.push(`Row ${rowNumber} (${row["Container Number"]}): Missing port or depot for OWN container (portId: ${portId}, depotId: ${depotId})`);
              } else {
                // Get onHireDate and remarks from leasingInfo if available with timezone-safe processing
                const leasingInfo = inventoryPayload.leasingInfo && inventoryPayload.leasingInfo.length > 0 ? inventoryPayload.leasingInfo[0] : {};
                let onHireDate = createLocalDateISO(new Date());
                if (row["On-Hire Date"] && row["On-Hire Date"].trim() !== "") {
                  const parsedDate = parseFlexibleDate(row["On-Hire Date"]);
                  if (parsedDate) {
                    onHireDate = createLocalDateISO(parsedDate);
                  }
                }
                const remarks = leasingInfo.remarks || '';
                // Get createdInventoryId from response
                const createdInventoryId = response.data?.id;
                try {
                  await axios.post('http://localhost:8000/leasinginfo', {
                    ownershipType: 'Own',
                    leasingRefNo: row["Lease Ref No"] || `OWN-${row["Container Number"]}`,
                    lessoraddressbookId: depotId,
                    onHireDepotaddressbookId: depotId,
                    portId: portId,
                    onHireDate: onHireDate,
                    offHireDate: null,
                    leaseRentPerDay: '',
                    remarks: remarks,
                    inventoryId: createdInventoryId,
                  });
                } catch (leasingError: any) {
                  failedCount.value++;
                  const leasingErrorMessage = leasingError.response?.data?.message || leasingError.message;
                  errors.push(`Row ${rowNumber} (${row["Container Number"]}): Failed to create LeasingInfo for OWN container: ${leasingErrorMessage}`);
                }
              }
            }
          } catch (error: any) {
            failedCount.value++;
            const errorMessage = error.response?.data?.message || error.message;
            errors.push(`Row ${rowNumber} (${row["Container Number"]}): ${errorMessage}`);
          }
        } catch (error: any) {
          failedCount.value++;
          const errorMessage = error.response?.data?.message || error.message || "Unknown error";
          const detailedError = error.response?.data?.error || "";
          const fullErrorMessage = detailedError 
            ? `${errorMessage} - Details: ${detailedError}` 
            : errorMessage;
          errors.push(`Row ${rowNumber} (Container: ${row["Container Number"] || "Unknown"}): ${fullErrorMessage}`);
          console.error(`Container import error for row ${rowNumber}:`, error);
        }
      }
      
      // Add skipped rows to errors if any
      if (skippedRows.length > 0) {
        errors.push(...skippedRows);
      }
      
      // Update statistics
      setImportStats({ 
        success: successCount.value, 
        failed: failedCount.value 
      });
      setErrorMessages(errors);
      
      console.log(`Import completed: ${successCount.value} success, ${failedCount.value} failed`);
      
      if (errors.length > 0 && successCount.value === 0) {
        setImportStatus("error");
      } else if (errors.length > 0) {
        setImportStatus("success"); // Partial success
        toast.success(`${successCount.value} containers imported with ${failedCount.value} errors`);
      } else {
        setImportStatus("success");
        toast.success(`All ${successCount.value} containers imported successfully!`);
      }
    } catch (error: any) {
      setImportStatus("error");
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      const detailedError = error.response?.data?.error || "";
      const fullErrorMessage = detailedError 
        ? `${errorMessage} - Details: ${detailedError}` 
        : errorMessage;
      setErrorMessages([`General container import error: ${fullErrorMessage}`]);
      console.error("Container import general error:", error);
    }
  };

  return (
    <div className="min-h-[80vh] bg-white dark:bg-neutral-900 pt-6 pb-10 flex justify-center items-start">
      <div className="w-full max-w-3xl">
        {/* Tabs at the top */}
        <div className="mb-4">
          <div className="inline-flex bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700 overflow-x-auto">
            <button
              className={`px-6 py-2 text-base font-medium focus:outline-none transition-colors ${selectedCategory === "companies" ? "bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white" : "bg-white dark:bg-neutral-800 text-black dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"}`}
              onClick={() => setSelectedCategory("companies")}
            >
              Companies
            </button>
            <button
              className={`px-6 py-2 text-base font-medium focus:outline-none transition-colors ${selectedCategory === "ports" ? "bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white" : "bg-white dark:bg-neutral-800 text-black dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"}`}
              onClick={() => setSelectedCategory("ports")}
            >
              Ports
            </button>
            <button
              className={`px-6 py-2 text-base font-medium focus:outline-none transition-colors ${selectedCategory === "containers" ? "bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white" : "bg-white dark:bg-neutral-800 text-black dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"}`}
              onClick={() => setSelectedCategory("containers")}
            >
              Containers
            </button>
          </div>
        </div>
        {/* Main card - moved up by reducing margin */}
        <div className="bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-8 relative transition-all duration-300 mt-0">
          {/* Download button top right */}
          <button
            onClick={handleDownloadEmptyTemplate}
            disabled={isDownloading}
            className="absolute top-6 right-8 flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-gray-200 rounded-md shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none text-sm font-medium transition-all duration-200 cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 mr-1" />
            Download CSV Template
          </button>
          {/* Section title */}
          <h2 className="text-xl font-bold text-black dark:text-white mb-6">
            {selectedCategory === "companies" && "Import Companies"}
            {selectedCategory === "ports" && "Import Ports"}
            {selectedCategory === "containers" && "Import Containers"}
          </h2>
          {/* Info box */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 mb-8">
            <div className="font-semibold text-black dark:text-gray-100 mb-2">
              {selectedCategory === "companies" && "How to import companies:"}
              {selectedCategory === "ports" && "How to import ports:"}
              {selectedCategory === "containers" && "How to import containers:"}
            </div>
            <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 text-base space-y-1">
              {selectedCategory === "companies" && (
                <>
                  <li>Download the CSV template</li>
                  <li>Fill it with your company data (Company Name & Country required)</li>
                  <li>Upload the completed file</li>
                  <li>Data will be automatically added to the Address Book</li>
                </>
              )}
              {selectedCategory === "ports" && (
                <>
                  <li>Download the CSV template</li>
                  <li>Fill it with your port data (all required fields must be filled)</li>
                  <li>Upload the completed file</li>
                  <li>Data will be automatically added to the Ports list</li>
                </>
              )}
              {selectedCategory === "containers" && (
                <>
                  <li>Download the CSV template</li>
                  <li>Fill it with your container data (all fields are required except periodic certificates and onhire reports)</li>
                  <li>Upload the completed file</li>
                  <li>Data will be automatically added to the Container Inventory</li>
                </>
              )}
            </ol>
          </div>
          {/* File upload area */}
          <div className="mb-4">
            <div className="border border-dashed rounded-md p-4 text-center border-neutral-300 dark:border-gray-300 bg-white dark:bg-neutral-900">
              <FileUploadArea
                onFileChange={setSelectedFile}
                selectedFile={selectedFile}
                isUploading={importStatus === "processing"}
              />
            </div>
          </div>
          {/* Import button (centered) */}
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleProcessCSV}
              className={`w-full max-w-xs bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-2 rounded-md shadow-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 cursor-pointer ${importStatus === "processing" ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={importStatus === "processing" || !selectedFile}
            >
              {importStatus === "processing" ? (
                <span className="flex flex-col items-center w-full">
                  {/* Premium Loader: animated dual ring spinner */}
                  <span className="mb-1 flex justify-center">
                    <span className="relative inline-block w-7 h-7">
                      <span className="absolute inset-0 rounded-full border-4 border-t-amber-400 border-b-yellow-400 border-l-transparent border-r-transparent animate-spin shadow-lg" style={{boxShadow: '0 0 12px 2px #ffb30055'}}></span>
                      <span className="absolute inset-2 rounded-full border-2 border-t-yellow-400 border-b-amber-400 border-l-transparent border-r-transparent animate-spin-reverse" style={{animationDuration: '1.2s', boxShadow: '0 0 8px 1px #ffb30033'}}></span>
                    </span>
                  </span>
                  <span className="text-xs text-white/80 tracking-wide">Processing your import...</span>
                </span>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Import Data
                </>
              )}
            </Button>
          </div>
          {/* Status and error messages (if any) */}
          {importStatus === "processing" && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-300">
                Processing your import. This may take a few minutes.
              </p>
            </div>
          )}
          {importStatus === "success" && importStats.success > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-green-400">
                Successfully imported {importStats.success} {importStats.success === 1 ? selectedCategory.slice(0, -1) : selectedCategory}.
              </p>
            </div>
          )}
          {importStatus === "error" && errorMessages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-red-400 font-semibold">
                Import Errors:
              </p>
              <ul className="list-disc list-inside text-sm text-red-300">
                {errorMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          {importStatus === "success" && importStats.failed > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-yellow-400">
                {importStats.failed} {importStats.failed === 1 ? "error" : "errors"} occurred during import. Please check the errors and try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImportTable;
