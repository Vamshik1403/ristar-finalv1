"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import AddContainerLeaseForm from "./AddContainerLeaseForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ContainerLeaseTariff {
  id: number;
  tariffCode: string;
  containerCategory: string;
  containerType: string;
  containerClass: string;
  leaseRentPerDay: number;
  currencyName: string;
  status: boolean;
}

const StatusBadge = ({ status }: { status: boolean }) => (
  <span
    className={cn(
      "inline-block px-4 py-1 rounded-full text-sm font-semibold shadow transition-all duration-300 hover:scale-105",
      status
        ? "bg-green-900/80 text-green-300"
        : "bg-red-900/80 text-red-300"
    )}
    style={{
      minWidth: 70,
      textAlign: "center",
      letterSpacing: 1,
    }}
  >
    {status ? "Active" : "Inactive"}
  </span>
);

const ContainerLeaseTariffPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [tariffs, setTariffs] = useState<ContainerLeaseTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTariff, setEditingTariff] = useState<ContainerLeaseTariff | null>(null);

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/container-lease-tariff"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tariffs");
        }
        const data = await response.json();
        // Ensure status is boolean
        setTariffs(
          data.map((item: any) => ({
            ...item,
            status:
              typeof item.status === "boolean"
                ? item.status
                : item.status === true ||
                  item.status === "true" ||
                  item.status === 1
          }))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch tariffs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTariffs();
  }, [showModal]);

  function handleDelete(id: number): void {
    if (window.confirm("Are you sure you want to delete this tariff?")) {
      fetch(`http://localhost:8000/container-lease-tariff/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete tariff");
          }
          setTariffs((prevTariffs) =>
            prevTariffs.filter((tariff) => tariff.id !== id)
          );
        })
        .catch((error) => {
          setError(
            error instanceof Error ? error.message : "Failed to delete tariff"
          );
        });
    }
  }

  function handleEditClick(id: number): void {
    const tariffToEdit = tariffs.find(t => t.id === id);
    if (tariffToEdit) {
      setEditingTariff(tariffToEdit);
      setShowModal(true);
    }
  }

  return (
    <div className="px-4 pt-0 pb-4">
      <div className="flex items-center justify-between mt-0 mb-4">
        <div className="relative w-full mr-4">
          <p className="font-bold text-lg text-white">Container Lease Tariff</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 shadow rounded-md transition-all duration-200 cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          Add Tariff
        </Button>

        {showModal && (
          <AddContainerLeaseForm
            onClose={() => {
              setShowModal(false);
              setEditingTariff(null);
            }}
            onSave={(data) => {
              if (editingTariff) {
                setTariffs(prevTariffs =>
                  prevTariffs.map(t =>
                    t.id === editingTariff.id ? { ...t, ...data } : t
                  )
                );
              } else {
                setTariffs(prevTariffs => [...prevTariffs, data]);
              }
              setShowModal(false);
              setEditingTariff(null);
            }}
            editData={editingTariff}
          />
        )}
      </div>

      <div className="rounded-lg shadow border border-neutral-800 bg-neutral-900 overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-900">
            <TableRow>
              <TableHead className="text-white">Tariff Code</TableHead>
              <TableHead className="text-white">Container Category</TableHead>
              <TableHead className="text-white">Type</TableHead>
              <TableHead className="text-white">Class</TableHead>
              <TableHead className="text-white">Lease Rent/Day</TableHead>
              <TableHead className="text-white">Currency</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-center text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-neutral-400 bg-neutral-900">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-red-400 py-8 bg-neutral-900">
                  {error}
                </TableCell>
              </TableRow>
            ) : tariffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-neutral-400 bg-neutral-900">
                  No tariffs found.
                </TableCell>
              </TableRow>
            ) : (
              tariffs.map((tariff) => (
                <TableRow
                  key={tariff.id}
                  className="transition-colors bg-neutral-900 hover:bg-neutral-800 border-b border-neutral-800"
                >
                  <TableCell className="text-white">{tariff.tariffCode}</TableCell>
                  <TableCell className="text-white">{tariff.containerCategory}</TableCell>
                  <TableCell className="text-white">{tariff.containerType}</TableCell>
                  <TableCell className="text-white">{tariff.containerClass}</TableCell>
                  <TableCell className="text-white">{tariff.leaseRentPerDay}</TableCell>
                  <TableCell className="text-white">{tariff.currencyName}</TableCell>
                  <TableCell>
                    <StatusBadge status={tariff.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(tariff.id)}
                      className={cn(
                        "hover:bg-blue-900 hover:text-blue-400 text-neutral-300 transition-all duration-200 cursor-pointer"
                      )}
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tariff.id)}
                      className={cn(
                        "hover:bg-red-900 hover:text-red-400 text-neutral-300 transition-all duration-200 cursor-pointer"
                      )}
                      title="Delete"
                    >
                      <Trash2 size={18} />
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

export default ContainerLeaseTariffPage;
