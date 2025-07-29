import React from "react";
import { Download, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewEmptyRepoJobModalProps {
  emptyRepoJob: any;
  onClose?: () => void;
  onDownload?: () => void;
  onEdit?: () => void;
}

const ViewEmptyRepoJobModal: React.FC<ViewEmptyRepoJobModalProps> = ({
  emptyRepoJob,
  onClose,
  onDownload,
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
              <div className="text-black dark:text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-[1000px] max-h-[90vh] overflow-y-auto border border-neutral-800 relative">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 z-10 flex justify-between items-center px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">Empty Repo Job Details</h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-400">
              Job Number: {emptyRepoJob?.jobNumber || "-"}
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
                Edit Empty Repo Job
              </Button>
            )}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="flex items-center gap-1 text-green-400 border-green-800 hover:border-green-700"
            >
              <Download size={16} />
              Download Empty Repo Job
            </Button> */}
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
                House BL:
              </span>
              <span className="text-black dark:text-white">
                {emptyRepoJob.houseBL || "-"}
              </span>
            </div>
            <div className="text-sm text-black dark:text-neutral-400">
              <span className="mr-2">Created:</span>
              {emptyRepoJob.createdAt
                ? new Date(emptyRepoJob.createdAt).toLocaleString()
                : "-"}
            </div>
          </div>

          {/* Section Blocks */}
          {renderSection("Basic Information", [
            ["Date", formatDate(emptyRepoJob.date)],
            ["Job Number", emptyRepoJob.jobNumber],
            ["House BL", emptyRepoJob.houseBL],
            ["Shipping Term", emptyRepoJob.shippingTerm],
          ])}

          {renderSection("Port Information", [
            ["Port Of Loading", emptyRepoJob.polPort?.portName],
            ["Port Of Discharge", emptyRepoJob.podPort?.portName],
            ["Free Days (POL)", emptyRepoJob.polFreeDays],
            ["Free Days (POD)", emptyRepoJob.podFreeDays],
            ["Detention Rate (POL)", emptyRepoJob.polDetentionRate],
            ["Detention Rate (POD)", emptyRepoJob.podDetentionRate],
            ...(emptyRepoJob.transhipmentPort
              ? ([
                  ["Transhipment Port", emptyRepoJob.transhipmentPort?.portName],
                ] as [string, any][])
              : ([] as [string, any][])),
          ])}

          {renderSection("Handling Agents", [
            [
              "Exp. Handling Agent",
              emptyRepoJob.expHandlingAgentAddressBook?.companyName,
            ],
            [
              "Imp. Handling Agent",
              emptyRepoJob.impHandlingAgentAddressBook?.companyName,
            ],
          ])}

          {renderSection("Vessel Details", [
            ["Carrier", emptyRepoJob.carrierAddressBook?.companyName],
            ["Vessel Name", emptyRepoJob.vesselName],
            ["Gate Closing Date", formatDate(emptyRepoJob.gsDate)],
            ["SOB Date", formatDate(emptyRepoJob.sob)],
            ["ETA to POD", formatDate(emptyRepoJob.etaTopod)],
          ])}

          {renderSection("Return Depot Information", [
            [
              "Empty Return Depot",
              emptyRepoJob.emptyReturnDepotAddressBook?.companyName,
            ],
            ["Estimated Empty Return Date", formatDate(emptyRepoJob.estimateDate)],
          ])}

          {renderSection("Container Information", [
            ["Quantity", emptyRepoJob.quantity],
            [
              "Container Numbers",
              emptyRepoJob.containers
                ?.map((c: any) => c.containerNumber)
                .join(", "),
            ],
          ])}

          {/* Containers Table */}
          {emptyRepoJob.containers && emptyRepoJob.containers.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-4">
                Container Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <thead className="bg-neutral-100 dark:bg-neutral-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700">
                        Container Number
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700">
                        Capacity
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700">
                        Tare Weight
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700">
                        Depot
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {emptyRepoJob.containers.map((container: any, index: number) => (
                      <tr
                        key={index}
                        className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <td className="px-4 py-2 text-sm text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700">
                          {container.containerNumber || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700">
                          {container.capacity || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700">
                          {container.tare || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700">
                          {container.depotName || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            className="text-black dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmptyRepoJobModal; 