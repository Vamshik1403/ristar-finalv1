"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AddTariffModal from "./DepotCleaningForm";
import axios from "axios";
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
  const isActive = status?.toLowerCase() === "active";
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

const DepotCleaningTable = () => {
  const [showModal, setShowModal] = useState(false);
  const [tariffData, setTariffData] = useState([]);
  const [form, setForm] = useState({
    id: undefined,
    status: "active",
    tariffCode: "",
    cleaningCharges: "0",
    addressBookId: 0,
    portId: 0,
    productId: 0,
    currencyId: 0,
  });

  const fetchTariffs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/depot-cleaning-tariff-cost");
      setTariffData(res.data);
    } catch (err) {
      console.error("Error fetching tariff data", err);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  useEffect(() => {
  }, [tariffData]);

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Depot Cleaning Cost</h2>
        <Button
          onClick={() => {
            setForm({
              id: undefined,
              status: "active",
              tariffCode: "",
              cleaningCharges: "0",
              addressBookId: 0,
              portId: 0,
              productId: 0,
              currencyId: 0,
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
          onClose={() => {
            setShowModal(false);
            fetchTariffs();
          }}
          formTitle={form.id ? "Edit Tariff" : "Add Tariff"}
          form={form}
          setForm={setForm}
        />
      )}

      <div className="rounded-lg shadow border border-neutral-800 bg-neutral-900 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Tariff Code</TableHead>
              <TableHead className="text-white">Depot Terminal</TableHead>
              <TableHead className="text-white">Service Port</TableHead>
              <TableHead className="text-white">Product</TableHead>
              <TableHead className="text-white">Currency</TableHead>
              <TableHead className="text-white">Cleaning Charge</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tariffData.length > 0 ? (
              tariffData.map((tariff: any) => (
                <TableRow key={tariff.id} className="hover:bg-neutral-800 text-white">
                  <TableCell>{tariff.tariffCode}</TableCell>
                  <TableCell>{tariff.addressBook?.companyName || "N/A"}</TableCell>
                  <TableCell>{tariff.port?.portName || "N/A"}</TableCell>
                  <TableCell>{tariff.product?.productName || "N/A"}</TableCell>
                  <TableCell>{tariff.currency?.currencyCode || "N/A"}</TableCell>
                  <TableCell>{tariff.cleaningCharges}</TableCell>
                  <TableCell>
                    <StatusBadge status={tariff.status} />
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit"
                      className="text-blue-400 hover:text-blue-500"
                      onClick={() => {
                        setForm({
                          id: tariff.id,
                          status: tariff.status || "inactive",
                          tariffCode: tariff.tariffCode || "",
                          productId: tariff.productId || 0,
                          addressBookId: tariff.addressBookId || 0,
                          portId: tariff.portId || 0,
                          currencyId: tariff.currencyId || 0,
                          cleaningCharges: String(tariff.cleaningCharges || "0"),
                        });
                        setShowModal(true);
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this tariff?")) {
                          axios
                            .delete(`http://localhost:8000/depot-cleaning-tariff-cost/${tariff.id}`)
                            .then(() => fetchTariffs())
                            .catch((err) => console.error("Failed to delete item", err));
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-400">
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

export default DepotCleaningTable;
