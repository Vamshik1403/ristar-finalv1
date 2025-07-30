import React from "react";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewAddressBookModalProps {
  addressBook: any;
  onClose?: () => void;
  onEdit?: () => void;
}

const ViewAddressBookModal: React.FC<ViewAddressBookModalProps> = ({
  addressBook,
  onClose,
  onEdit,
}) => {
  const handleClose = () => {
    if (onClose) onClose();
  };

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString() : "";

  // Helper to render a section with filtered fields
  const renderSection = (title: string, fields: [string, any][]) => {
    const visibleFields = fields.filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    );
    if (visibleFields.length === 0) return null;

    return (
      <div>
        <h3 className="text-lg font-medium text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-4">
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {visibleFields.map(([label, value], idx) => (
            <div key={idx}>
              <label className="block text-sm text-neutral-700 dark:text-neutral-400 mb-1">
                {label}
              </label>
              <div className="text-black dark:text-white">
                {label === "Business Type" ? formatBusinessType(value) : value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to format business type with proper spacing and commas
  const formatBusinessType = (businessType: any) => {
    if (!businessType) return "";
    
    // Convert to string if it's not already
    const businessTypeStr = String(businessType);
    
    // Split by common separators and clean up
    const types = businessTypeStr
      .split(/[,,\s]+/) // Split by comma, space, or multiple spaces
      .map(type => type.trim()) // Remove extra spaces
      .filter(type => type.length > 0); // Remove empty strings
    
    // Join with commas and spaces
    return types.join(", ");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[1000px] max-h-[90vh] overflow-y-auto border border-neutral-800 relative">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 z-10 flex justify-between items-center px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">Address Book Details</h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-400">
              Company: {addressBook?.companyName || "-"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex items-center gap-1 text-blue-400 border-blue-800 hover:border-blue-700"
              >
                <Pencil size={16} />
                Edit Company
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-neutral-400 hover:text-black dark:hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Status + Created */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="font-medium text-black dark:text-white">
                Status:
              </span>
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold shadow transition-all duration-300
                ${addressBook?.status?.toLowerCase() === "active"
                  ? "bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100"
                  : "bg-red-200 text-red-900 dark:bg-red-500 dark:text-red-100"}
                hover:scale-105`}>
                {addressBook?.status || "N/A"}
              </span>
            </div>
            <div className="text-sm text-neutral-700 dark:text-neutral-400">
              Created: {formatDate(addressBook?.createdAt)}
            </div>
          </div>

          {/* General Information */}
          {renderSection("General Information", [
            ["Company Name", addressBook?.companyName],
            ["Reference ID", addressBook?.refId],
            ["Business Type", addressBook?.businessType],
            ["Country", addressBook?.country?.countryName],
            ["Address", addressBook?.address],
            ["Phone", addressBook?.phone],
            ["Email", addressBook?.email],
            ["Website", addressBook?.website],
            ["Credit Terms", addressBook?.creditTerms],
            ["Credit Limit", addressBook?.creditLimit],
            ["Remarks", addressBook?.remark],
          ])}

          {/* Port Information */}
          {addressBook?.businessPorts && addressBook.businessPorts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-4">
                Associated Ports
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {addressBook.businessPorts.map((bp: any, idx: number) => (
                  <div key={idx}>
                    <label className="block text-sm text-neutral-700 dark:text-neutral-400 mb-1">
                      Port {idx + 1}
                    </label>
                    <div className="text-black dark:text-white">
                      {bp.port?.portName || "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {addressBook?.contacts && addressBook.contacts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-4">
                Contact Information
              </h3>
              <div className="space-y-6">
                {addressBook.contacts.map((contact: any, idx: number) => (
                  <div key={idx} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800">
                    <h4 className="text-md font-semibold text-black dark:text-white mb-3">
                      Contact #{idx + 1}
                    </h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {[
                        ["Title", contact.title],
                        ["First Name", contact.firstName],
                        ["Last Name", contact.lastName],
                        ["Designation", contact.designation],
                        ["Department", contact.department],
                        ["Email", contact.email],
                        ["Landline No", contact.landline],
                        ["Mobile No", contact.mobile],
                      ].map(([label, value], fieldIdx) => (
                        <div key={fieldIdx}>
                          <label className="block text-sm text-neutral-700 dark:text-neutral-400 mb-1">
                            {label}
                          </label>
                          <div className="text-black dark:text-white font-medium">
                            {value || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Details */}
          {addressBook?.bankDetails && addressBook.bankDetails.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-4">
                Bank Details
              </h3>
              <div className="space-y-6">
                {addressBook.bankDetails.map((bank: any, idx: number) => (
                  <div key={idx} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800">
                    <h4 className="text-md font-semibold text-black dark:text-white mb-3">
                      Bank Account #{idx + 1}
                    </h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {[
                        ["Account No.", bank.accountNumber],
                        ["Bank Name", bank.bankName],
                        ["Address", bank.address],
                        ["USCI", bank.usci],
                        ["Branch Name", bank.branchName],
                        ["Branch Code", bank.branchCode],
                        ["Swift Code", bank.swiftCode],
                        ["Currency", bank.currency],
                      ].map(([label, value], fieldIdx) => (
                        <div key={fieldIdx} className={label === "Address" ? "md:col-span-2" : ""}>
                          <label className="block text-sm text-neutral-700 dark:text-neutral-400 mb-1">
                            {label}
                          </label>
                          <div className="text-black dark:text-white font-medium">
                            {value || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <div className="flex justify-center">
            <Button
              onClick={handleClose}
              className="px-6 py-2 bg-neutral-600 text-white rounded-md cursor-pointer hover:bg-neutral-700"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAddressBookModal; 