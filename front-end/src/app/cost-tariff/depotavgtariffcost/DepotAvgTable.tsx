"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AddTariffModal from "./DepotAvgForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status.toLowerCase() === "active";
  return (
    <span
      className={`inline-block px-4 py-1 rounded-full text-sm font-semibold shadow transition-all duration-300
        ${isActive ? "bg-green-700 text-green-200" : "bg-red-700 text-red-200"}
        hover:scale-105`}
      style={{
        minWidth: 70,
        textAlign: "center",
        letterSpacing: 1,
      }}
    >
      {status}
    </span>
  );
};

const DepotAvgCost = () => {
  const [showModal, setShowModal] = useState(false);
  const [tariffs, setTariffs] = useState([]);
  const [form, setForm] = useState({
    id: undefined,
    status: "Inactive",
    tariffCode: "",
    depotTerminalId: "",
    servicePort: "",
    currency: "",
    manlidPTFE: "0",
    leakTest: "0",
    loadOnLoadOff: "0",
    cleaningSurvey: "0",
    maintenanceAndRepair: "0",
    total: "0",
  });

  const fetchTariffs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/depot-avg-tariff");
      setTariffs(res.data);
    } catch (err) {
      console.error("Failed to fetch tariffs:", err);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:8000/depot-avg-tariff/${id}`);
        fetchTariffs();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Depot Avg Tariff</h2>
        <Button
          onClick={() => {
            setForm({
              id: undefined,
              status: "Inactive",
              tariffCode: "",
              depotTerminalId: "",
              servicePort: "",
              currency: "",
              manlidPTFE: "0",
              leakTest: "0",
              loadOnLoadOff: "0",
              cleaningSurvey: "0",
              maintenanceAndRepair: "0",
              total: "0",
            });
            setShowModal(true);
          }}
          className="bg-blue-700 hover:bg-blue-800 text-white"
        >
          <Plus className="mr-2" size={16} /> Add Tariff
        </Button>
      </div>

      {showModal && (
        <AddTariffModal
          onClose={() => setShowModal(false)}
          formTitle={form.id ? "Edit Depot Avg Tariff" : "Add Depot Avg Tariff"}
          form={form}
          setForm={setForm}
          fetchTariffs={fetchTariffs}
        />
      )}

      <div className="rounded-lg shadow border border-neutral-800 bg-neutral-900 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {["Tariff Code", "Depot Terminal", "Service Port", "Currency", "MANLID PTFE", "Leak Test", "Load On Load Off", "Cleaning Survey", "Maintenance and Repair", "Total", "Status", "Actions"].map(
                (title) => (
                  <TableHead key={title} className="text-white">
                    {title}
                  </TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tariffs.length > 0 ? (
              tariffs.map((row: any) => (
                <TableRow key={row.id} className="hover:bg-neutral-800 text-white">
                  <TableCell>{row.tariffCode}</TableCell>
                  <TableCell>{row.addressBook?.companyName || "N/A"}</TableCell>
                  <TableCell>{row.port?.portName || "N/A"}</TableCell>
                  <TableCell>{row.currency?.currencyCode || "N/A"}</TableCell>
                  <TableCell>{row.manlidPTFE}</TableCell>
                  <TableCell>{row.leakTest}</TableCell>
                  <TableCell>{row.loadOnLoadOff}</TableCell>
                  <TableCell>{row.cleaningSurvey}</TableCell>
                  <TableCell>{row.maintenanceAndRepair}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm({
                          id: row.id,
                          status: row.status,
                          tariffCode: row.tariffCode,
                          depotTerminalId: row.addressBookId?.toString() || "",
                          servicePort: row.portId?.toString() || "",
                          currency: row.currencyId?.toString() || "",
                          manlidPTFE: row.manlidPTFE?.toString() || "0",
                          leakTest: row.leakTest?.toString() || "0",
                          loadOnLoadOff: row.loadOnLoadOff?.toString() || "0",
                          cleaningSurvey: row.cleaningSurvey?.toString() || "0",
                          maintenanceAndRepair: row.maintenanceAndRepair?.toString() || "0",
                          total: row.total?.toString() || "0",
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-500"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(row.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-6 text-gray-400">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DepotAvgCost;
