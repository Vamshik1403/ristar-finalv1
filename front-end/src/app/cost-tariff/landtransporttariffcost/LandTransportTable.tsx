"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import AddTariffModal from "./LandTransportform";
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
      style={{ minWidth: 70, textAlign: "center", letterSpacing: 1 }}
    >
      {status}
    </span>
  );
};

const LandTransportTariff = () => {
  const [showModal, setShowModal] = useState(false);
  const [tariffs, setTariffs] = useState([]);
  const [form, setForm] = useState({
    id: undefined,
    landTransportTariffCode: "",
    addressBookId: "",
    transportType: "",
    from: "",
    to: "",
    distance: "",
    currencyId: "",
    amount: "",
    approvalStatus: "Pending",
  });

  const fetchTariffs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/land-transport-tariff");
      setTariffs(res.data);
    } catch (err) {
      console.error("Error fetching tariffs:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tariff?")) return;
    try {
      await axios.delete(`http://localhost:8000/land-transport-tariff/${id}`);
      fetchTariffs();
    } catch (err) {
      console.error("Error deleting tariff:", err);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Land Transport Tariff</h2>
        <Button
          onClick={() => {
            setForm({
              id: undefined,
              landTransportTariffCode: "",
              addressBookId: "",
              transportType: "",
              from: "",
              to: "",
              distance: "",
              currencyId: "",
              amount: "",
              approvalStatus: "Pending",
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
          formTitle={form.id ? "Edit Land Transport Tariff" : "Add Land Transport Tariff"}
          form={form}
          setForm={setForm}
          fetchTariffs={fetchTariffs}
        />
      )}

      <div className="rounded-lg shadow border border-neutral-800 bg-neutral-900 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {["Tariff Code", "Company", "From", "To", "Distance", "Transport Type", "Amount", "Currency", "Status", "Actions"].map(
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
                  <TableCell>{row.landTransportTariffCode}</TableCell>
                  <TableCell>{row.addressBook?.companyName || "N/A"}</TableCell>
                  <TableCell>{row.from}</TableCell>
                  <TableCell>{row.to}</TableCell>
                  <TableCell>{row.distance}</TableCell>
                  <TableCell>{row.transportType}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.currency?.currencyName || "N/A"}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.approvalStatus === "Approved" ? "Active" : "Inactive"} />
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm({
                          id: row.id,
                          landTransportTariffCode: row.landTransportTariffCode || "",
                          addressBookId: row.addressBookId || "",
                          transportType: row.transportType || "",
                          from: row.from || "",
                          to: row.to || "",
                          distance: row.distance || "",
                          currencyId: row.currencyId || "",
                          amount: row.amount || "",
                          approvalStatus: row.approvalStatus || "Pending",
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
                <TableCell colSpan={10} className="text-center py-6 text-gray-400">
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

export default LandTransportTariff;
