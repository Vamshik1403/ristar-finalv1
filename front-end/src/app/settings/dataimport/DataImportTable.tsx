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

// Update the containerCSVHeaders array to match your Excel headers
const containerCSVHeaders = [
  "ID",
  "Container Number",
  "Container Category", 
  "Container Type",
  "Container Size",
  "Container Class",
  "Capacity",
  "Manufacturer",
  "Build Year",
  "Gross Wt",
  "Tare Wt",
  "Ownership",
  "LEASE REF",
  "LEASE RENTAL",
  "OWNERSHIP",
  "On-Hire Date",
  "Onhire Location",
  "On Hire DEPOT",
  "OWNER",
  "Off-Hire Date",
  "Lease Rent Per Day",
  "remarks",
  "Last Inspection Date", // Changed from "Inspection Date" to match Excel
  "Inspection Type",
  "Next Inspection Due", // Changed from "Next Due Date" to match Excel
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
          <p className="mt-2 text-sm text-gray-500">
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
          <p className="font-medium text-gray-800">{selectedFile.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            {`${(selectedFile.size / 1024).toFixed(2)} KB`}
          </p>
          <button 
            onClick={() => onFileChange(null)} 
            className="text-xs text-red-500 underline mt-2 hover:text-red-700"
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

  // Set your actual fallback IDs here:
  const DEFAULT_DEPOT_ID = 1; // Replace with your actual 'Unknown Depot' ID
  const DEFAULT_PORT_ID = 1;  // Replace with your actual 'Unknown Port' ID

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
      "Manufacturer": "manufacturer",
      "Build Year": "buildYear",
      "Gross Wt": "grossWt", // Match Excel header
      "Tare Wt": "tareWt", // Match Excel header
      "Gross Weight": "grossWt", // Keep for backward compatibility
      "Tare Weight": "tareWt", // Keep for backward compatibility
      "Ownership": "ownership",
      "LEASE REF": "leasingRefNo",
      "LEASE RENTAL": "leaseRentPerDay",
      "OWNERSHIP": "ownership",
      "On-Hire Date": "onHireDate",
      "Onhire Location": "onHireLocation",
      "On Hire DEPOT": "onHireDepotId",
      "Off-Hire Date": "offHireDate",
      "Lease Rent Per Day": "leaseRentPerDay",
      "remarks": "remarks",
      "Last Inspection Date": "inspectionDate", // Map "Last Inspection Date" to "inspectionDate"
      "Inspection Type": "inspectionType",
      "Next Inspection Due": "nextDueDate", // Map "Next Inspection Due" to "nextDueDate"
      "Certificate": "certificate",
      "Report Date": "reportDate",
      "Report Document": "reportDocument"
    };
    
    return containerFieldMap[header] || header;
  };

  // Validate a single row of container CSV data
  const validateContainerRow = (row: Record<string, string>): string | null => {
    // Required fields for container import based on Excel template headers
    const requiredFields = ["Container Number", "Container Category", "Container Type", "Container Class", "Ownership"];
    
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
    
    // Validate ownership type - REQUIRED field
    const ownership = row["Ownership"]?.trim().toUpperCase();
    if (!ownership) {
      return `Ownership is required for container ${containerNumber}`;
    }
    if (ownership !== "OWN" && ownership !== "OWNED" && ownership !== "LEASED" && ownership !== "LEASE") {
      return `Invalid Ownership: ${row["Ownership"]}. Must be either "OWN", "OWNED", "LEASED", or "LEASE" (case insensitive)`;
    }
    
    // Additional validation for LEASED containers
    if (ownership === "LEASED" || ownership === "LEASE") {
      if (!row["OWNER"] || row["OWNER"].trim() === "") {
        return `OWNER field is required for LEASED container ${containerNumber}`;
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
    
    const successCount = { value: 0 };
    const failedCount = { value: 0 };
    const errors: string[] = [];
    
    try {
      // Fetch all countries to map country names to IDs
      const countriesResponse = await axios.get("http://localhost:8000/country");
      const countries = countriesResponse.data;
      
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
          
          // Map each CSV field to its API equivalent
          Object.keys(row).forEach(header => {
            if (row[header] && row[header].trim() !== "") {
              const field = mapHeaderToField(header);
              if (field !== header) { // if we have a mapping
                payload[field] = row[header].trim();
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
          
          // Submit to API
          await axios.post("http://localhost:8000/addressbook", payload);
          successCount.value++;
        } catch (error: any) {
          failedCount.value++;
          const errorMessage = error.response?.data?.message || error.message;
          errors.push(`Row ${i+1}: ${errorMessage}`);
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
      setErrorMessages([`General error: ${error.message}`]);
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
          
          // Submit to API
          await axios.post("http://localhost:8000/ports", payload);
          successCount.value++;
        } catch (error: any) {
          failedCount.value++;
          const errorMessage = error.response?.data?.message || error.message;
          errors.push(`Row ${i+1}: ${errorMessage}`);
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
      setErrorMessages([`General error: ${error.message}`]);
    }
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
            capacityUnit: "L",
            manufacturer: row["Manufacturer"]?.trim() || "",
            buildYear: row["Build Year"]?.trim() || "",
            grossWeight: (row["Gross Wt"] && String(row["Gross Wt"]).trim() !== "") ? String(row["Gross Wt"]).trim() : "",
            tareWeight: (row["Tare Wt"] && String(row["Tare Wt"]).trim() !== "") ? String(row["Tare Wt"]).trim() : "",
            InitialSurveyDate: "",
            leasingInfo: [],
            periodicTankCertificates: [],
            onHireReport: []
          };
          
          // Handle ownership-specific fields - NO DEFAULT VALUES
          if (ownershipUpper === "OWN" || ownershipUpper === "OWNED") {
            // Find portId by port name or code
            let portId = null;
            if (row["Onhire Location"]) {
              const foundPort = portsEntries.find((p: any) =>
                p.portName?.trim().toLowerCase() === row["Onhire Location"].trim().toLowerCase() ||
                p.portCode?.trim().toLowerCase() === row["Onhire Location"].trim().toLowerCase()
              );
              portId = foundPort ? foundPort.id : null;
            }

            // Find depotId by company name or ID
            let depotId = null;
            if (row["On Hire DEPOT"]) {
              const foundDepot = addressBookEntries.find((d: any) =>
                d.companyName?.trim().toLowerCase() === row["On Hire DEPOT"].trim().toLowerCase() ||
                String(d.id) === row["On Hire DEPOT"].trim()
              );
              depotId = foundDepot ? foundDepot.id : null;
            }

            // Use fallback IDs if not found
            if (!portId) {
              errors.push(`Row ${rowNumber} (${row["Container Number"]}): Port not found for Onhire Location: ${row["Onhire Location"]}. Using default port ID ${DEFAULT_PORT_ID}.`);
              portId = DEFAULT_PORT_ID;
            }
            if (!depotId) {
              errors.push(`Row ${rowNumber} (${row["Container Number"]}): Depot not found for On Hire DEPOT: ${row["On Hire DEPOT"]}. Using default depot ID ${DEFAULT_DEPOT_ID}.`);
              depotId = DEFAULT_DEPOT_ID;
            }

            inventoryPayload.portId = portId;
            inventoryPayload.onHireDepotaddressbookId = depotId;
            inventoryPayload.ownership = "Own";

            // Always create leasingInfo for Own, using fallback IDs if needed
            inventoryPayload.leasingInfo.push({
              ownershipType: "Own",
              leasingRefNo: `OWN-${row["Container Number"]}`,
              leasoraddressbookId: depotId,
              onHireDepotaddressbookId: depotId,
              portId: portId,
              onHireDate: new Date().toISOString(),
              offHireDate: null,
              leaseRentPerDay: "",
              remarks: ""
            });
          } else if (ownershipUpper === "LEASED" || ownershipUpper === "LEASE") {
            // For LEASED containers, keep strict validation
            let leasorId = null;
            let portId = null;
            let depotId = null;
            if (row["OWNER"] && row["OWNER"].trim() !== "") {
              const ownerValue = row["OWNER"].trim();
              const leasor = addressBookEntries.find(
                (a: any) => a.companyName.toLowerCase().trim() === ownerValue.toLowerCase().trim() ||
                           a.id.toString() === ownerValue
              );
              if (leasor) {
                leasorId = leasor.id;
              } else {
                errors.push(`Row ${rowNumber} (${row["Container Number"]}): Leasor not found for OWNER: ${row["OWNER"]}`);
              }
            }
            if (row["Onhire Location"] && row["Onhire Location"].trim() !== "") {
              const onHireLocationValue = row["Onhire Location"].trim();
              let port = portsEntries.find((p: any) => p.id === Number(onHireLocationValue));
              if (!port) {
                port = portsEntries.find(
                  (p: any) => p.portName.toLowerCase().trim() === onHireLocationValue.toLowerCase().trim()
                );
              }
              if (port) {
                portId = port.id;
              } else {
                errors.push(`Row ${rowNumber} (${row["Container Number"]}): Port not found for Onhire Location: ${row["Onhire Location"]}`);
              }
            }
            if (row["On Hire DEPOT"] && row["On Hire DEPOT"].trim() !== "") {
              const depotValue = row["On Hire DEPOT"].trim();
              let depot = addressBookEntries.find((a: any) => a.id === Number(depotValue));
              if (!depot) {
                depot = addressBookEntries.find(
                  (a: any) => a.companyName.toLowerCase().trim() === depotValue.toLowerCase().trim()
                );
              }
              if (depot) {
                depotId = depot.id;
              } else {
                errors.push(`Row ${rowNumber} (${row["Container Number"]}): Depot not found for On Hire DEPOT: ${row["On Hire DEPOT"]}`);
              }
            }
            if (!leasorId || !portId || !depotId) {
              errors.push(`Row ${rowNumber} (${row["Container Number"]}): Skipped LEASED record due to missing references.`);
              continue;
            }
            // Create leasing info record for LEASED containers
            let onHireDate = new Date().toISOString();
            let offHireDate = null;
            if (row["On-Hire Date"] && row["On-Hire Date"].trim() !== "") {
              try {
                onHireDate = new Date(row["On-Hire Date"]).toISOString();
              } catch (e) {}
            }
            if (row["Off-Hire Date"] && row["Off-Hire Date"].trim() !== "") {
              try {
                offHireDate = new Date(row["Off-Hire Date"]).toISOString();
              } catch (e) {}
            }
            inventoryPayload.leasingInfo.push({
              ownershipType: "Leased",
              leasingRefNo: row["LEASE REF"] || `LEASE-${row["Container Number"]}`,
              leasoraddressbookId: leasorId,
              onHireDepotaddressbookId: depotId,
              portId: portId,
              onHireDate: onHireDate,
              offHireDate: offHireDate,
              leaseRentPerDay: row["Lease Rent Per Day"] || row["LEASE RENTAL"] || "0",
              remarks: row["remarks"] || ""
            });
          }
          
          // Add periodic tank certificates if provided
          if (row["Last Inspection Date"] && row["Inspection Type"] && row["Last Inspection Date"].trim() !== "") {
            try {
              const inspectionDate = new Date(row["Last Inspection Date"]).toISOString();
              const nextDueDate = row["Next Inspection Due"] && row["Next Inspection Due"].trim() !== "" 
                ? new Date(row["Next Inspection Due"]).toISOString() 
                : new Date().toISOString();
                
              inventoryPayload.periodicTankCertificates.push({
                inspectionDate: inspectionDate,
                inspectionType: row["Inspection Type"],
                nextDueDate: nextDueDate,
                certificate: row["Certificate"] || ""
              });
            } catch (e) {
              console.warn(`Invalid date format for inspection dates in row ${rowNumber}`);
            }
          }
          
          // Add on-hire report if provided
          if (row["Report Date"] && row["Report Date"].trim() !== "") {
            try {
              inventoryPayload.onHireReport.push({
                reportDate: new Date(row["Report Date"]).toISOString(),
                reportDocument: row["Report Document"] || ""
              });
            } catch (e) {
              console.warn(`Invalid date format for report date in row ${rowNumber}`);
            }
          }

          // Step 2: Submit the complete inventory payload
          try {
            const response = await axios.post("http://localhost:8000/inventory", inventoryPayload);
            console.log(`✓ Successfully created container ${row["Container Number"]} (Row ${rowNumber})`);
            successCount.value++;
          } catch (error: any) {
            failedCount.value++;
            const errorMessage = error.response?.data?.message || error.message;
            errors.push(`Row ${rowNumber} (${row["Container Number"]}): ${errorMessage}`);
          }
        } catch (error: any) {
          failedCount.value++;
          const errorMessage = error.message || "Unknown error";
          errors.push(`Row ${rowNumber} (${row["Container Number"] || "Unknown"}): ${errorMessage}`);
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
      
      if (errors.length > 0) {
        console.error("IMPORT ERRORS:", errors);
        setErrorMessages(errors);
      }
      
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
      setErrorMessages([`General error: ${error.message}`]);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Data Import - {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <Tabs defaultValue="companies" className="h-full">
                <TabsList>
                  <TabsTrigger
                    value="companies"
                    onClick={() => setSelectedCategory("companies")}
                    className={`py-2 px-4 text-sm font-medium rounded-l-md transition-all flex items-center justify-center ${
                      selectedCategory === "companies"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Companies
                  </TabsTrigger>
                  <TabsTrigger
                    value="ports"
                    onClick={() => setSelectedCategory("ports")}
                    className={`py-2 px-4 text-sm font-medium transition-all flex items-center justify-center ${
                      selectedCategory === "ports"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Ports
                  </TabsTrigger>
                  <TabsTrigger
                    value="containers"
                    onClick={() => setSelectedCategory("containers")}
                    className={`py-2 px-4 text-sm font-medium rounded-r-md transition-all flex items-center justify-center ${
                      selectedCategory === "containers"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Containers
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="companies" className="pt-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Import your company data using our CSV template. Ensure all
                      fields are correctly filled before uploading.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
                      <Button
                        onClick={handleDownloadEmptyTemplate}
                        disabled={isDownloading}
                        className="w-full sm:w-auto"
                      >
                        {isDownloading ? (
                          <span className="animate-spin">Downloading...</span>
                        ) : (
                          <>
                            <Upload className="mr-2 h-5 w-5" />
                            Download Empty Template
                          </>
                        )}
                      </Button>
                      <FileUploadArea
                        onFileChange={setSelectedFile}
                        selectedFile={selectedFile}
                        isUploading={importStatus === "processing"}
                      />
                    </div>
                    {importStatus === "processing" && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          Processing your import. This may take a few minutes.
                        </p>
                        <div className="flex justify-center mt-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      </div>
                    )}
                    {importStatus === "success" && importStats.success > 0 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-green-600">
                          Successfully imported {importStats.success}{" "}
                          {importStats.success === 1 ? "company" : "companies"}.
                        </p>
                      </div>
                    )}
                    {importStatus === "error" && errorMessages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-red-600 font-semibold">
                          Import Errors:
                        </p>
                        <ul className="list-disc list-inside text-sm text-red-500">
                          {errorMessages.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {importStatus === "success" && importStats.failed > 0 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-yellow-600">
                          {importStats.failed}{" "}
                          {importStats.failed === 1 ? "error" : "errors"} occurred
                          during import. Check the list above for details.
                        </p>
                      </div>
                    )}
                    <div className="mt-6">
                      <Button
                        onClick={handleProcessCSV}
                        className="w-full sm:w-auto"
                        disabled={importStatus === "processing" || !selectedFile}
                      >
                        {importStatus === "processing" ? (
                          <span className="animate-spin">Processing...</span>
                        ) : (
                          <>
                            <Upload className="mr-2 h-5 w-5" />
                            Import Companies Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="ports" className="pt-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Import your port data using our CSV template. Ensure all fields
                      are correctly filled before uploading.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
                      <Button
                        onClick={handleDownloadEmptyTemplate}
                        disabled={isDownloading}
                        className="w-full sm:w-auto"
                      >
                        {isDownloading ? (
                          <span className="animate-spin">Downloading...</span>
                        ) : (
                          <>
                            <Upload className="mr-2 h-5 w-5" />
                            Download Empty Template
                          </>
                        )}
                      </Button>
                      <FileUploadArea
                        onFileChange={setSelectedFile}
                        selectedFile={selectedFile}
                        isUploading={importStatus === "processing"}
                      />
                    </div>
                    {importStatus === "processing" && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          Processing your import. This may take a few minutes.
                        </p>
                        <div className="flex justify-center mt-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      </div>
                    )}
                    {importStatus === "success" && importStats.success > 0 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-green-600">
                          Successfully imported {importStats.success}{" "}
                          {importStats.success === 1 ? "port" : "ports"}.
                        </p>
                      </div>
                    )}
                    {importStatus === "error" && errorMessages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-red-600 font-semibold">
                          Import Errors:
                        </p>
                        <ul className="list-disc list-inside text-sm text-red-500">
                          {errorMessages.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {importStatus === "success" && importStats.failed > 0 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-yellow-600">
                          {importStats.failed}{" "}
                          {importStats.failed === 1 ? "error" : "errors"} occurred
                          during import. Check the list above for details.
                        </p>
                      </div>
                    )}
                    <div className="mt-6">
                      <Button
                        onClick={handleProcessCSV}
                        className="w-full sm:w-auto"
                        disabled={importStatus === "processing" || !selectedFile}
                      >
                        {importStatus === "processing" ? (
                          <span className="animate-spin">Processing...</span>
                        ) : (
                          <>
                            <Upload className="mr-2 h-5 w-5" />
                            Import Ports Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="containers" className="pt-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Import your container data using our CSV template. Ensure all
                      fields are correctly filled before uploading.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
                      <Button
                        onClick={handleDownloadEmptyTemplate}
                        disabled={isDownloading}
                        className="w-full sm:w-auto"
                      >
                        {isDownloading ? (
                          <span className="animate-spin">Downloading...</span>
                        ) : (
                          <>
                            <Upload className="mr-2 h-5 w-5" />
                            Download Empty Template
                          </>
                        )}
                      </Button>
                      <FileUploadArea
                        onFileChange={setSelectedFile}
                        selectedFile={selectedFile}
                        isUploading={importStatus === "processing"}
                      />
                    </div>
                    {importStatus === "processing" && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          Processing your import. This may take a few minutes.
                        </p>
                        <div className="flex justify-center mt-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      </div>
                    )}
                    {importStatus === "success" && importStats.success > 0 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-green-600">
                          Successfully imported {importStats.success}{" "}
                          {importStats.success === 1 ? "container" : "containers"}.
                        </p>
                      </div>
                    )}
                    {importStatus === "error" && errorMessages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-red-600 font-semibold">
                          Import Errors:
                          Import Errors:
                        </p>
                        <ul className="list-disc list-inside text-sm text-red-500">
                          {errorMessages.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {importStatus === "success" && importStats.failed > 0 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-yellow-600">
                          {importStats.failed}{" "}
                          {importStats.failed === 1 ? "error" : "errors"} occurred
                          during import. Check the list above for details.
                        </p>
                      </div>
                    )}
                    <div className="mt-6">
                      <Button
                        onClick={handleProcessCSV}
                        className="w-full sm:w-auto"
                        disabled={importStatus === "processing" || !selectedFile}
                      >
                        {importStatus === "processing" ? (
                          <span className="animate-spin">Processing...</span>
                        ) : (
                          <>
                            <Upload className="mr-2 h-5 w-5" />
                            Import Containers Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImportTable;
