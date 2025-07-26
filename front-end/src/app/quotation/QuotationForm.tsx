"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

const AddQuotationModal = ({
  onClose,
  formTitle,
  form,
  setForm,
  fetchQuotations,
}: any) => {
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [portSuggestions, setPortSuggestions] = useState<any[]>([]);
  const [showPortDropdown, setShowPortDropdown] = useState(false);
  const [showDischargeDropdown, setShowDischargeDropdown] = useState(false);
  const [expDepots, setExpDepots] = useState<{ id: number; companyName: string }[]>([]);
  const [emptyReturnDepots, setEmptyReturnDepots] = useState<{ id: number; companyName: string }[]>([]);
  const [expAgents, setExpAgents] = useState<{ id: number; companyName: string }[]>([]);
  const [impHandlingAgents, setImpHandlingAgents] = useState<{ id: number; companyName: string }[]>([]);
  const [transhipmentPortSuggestions, setTranshipmentPortSuggestions] = useState<any[]>([]);
  const [showTranshipmentDropdown, setShowTranshipmentDropdown] = useState(false);
  const [trsHandlingAgents, setTrsHandlingAgents] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Required field validations
    const requiredFields = [
      { field: 'productId', message: 'Please select a product' },
      { field: 'customerId', message: 'Please select a customer' },
      { field: 'portOfLoadingId', message: 'Please select a port of loading' },
      { field: 'portOfDischargeId', message: 'Please select a port of discharge' }
    ];

    for (const { field, message } of requiredFields) {
      if (!form[field]) {
        alert(message);
        return;
      }
    }

    // Ensure none of the string fields are null
    const ensureString = (value: any) => value === null || value === undefined ? '' : value;

    // Use existing dates for edit mode or set new dates for new records
    let effectiveDate, validTillDate;

    if (form.isEditing && form.effectiveDate && form.validTillDate) {
      effectiveDate = new Date(form.effectiveDate).toISOString();
      validTillDate = new Date(form.validTillDate).toISOString();
    } else {
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      effectiveDate = today.toISOString();
      validTillDate = sevenDaysLater.toISOString();
    }

    const payload = {
      quotationRefNumber: form.quotationRef,
      status: form.status ? "ACTIVE" : "INACTIVE",
      effectiveDate: effectiveDate,
      validTillDate: validTillDate,
      shippingTerm: form.shippingTerm || '',
      custAddressBookId: Number(form.customerId),
      billingParty: form.billingParty || '',
      rateType: form.rateType || '',
      billingType: form.billingType || '',
      productId: Number(form.productId),
      polPortId: Number(form.portOfLoadingId),
      podPortId: Number(form.portOfDischargeId),
      polFreeDays: form.expFreeDays || '',
      podFreeDays: form.impFreeDays || '',
      polDetentionRate: form.expDetentionRate || '',
      podDetentionRate: form.impDetentionRate || '',
      expDepotAddressBookId: Number(form.expDepotId),
      emptyReturnAddressBookId: Number(form.emptyReturnDepot),
      expHandlingAgentAddressBookId: Number(form.expHAgentId),
      impHandlingAgentAddressBookId: Number(form.impHAgentId),
      transitDays: form.transitDays || '',
      transhipmentPortId: form.enableTranshipmentPort ? Number(form.transhipmentPortId) : null,
      transhipmentHandlingAgentAddressBookId: form.enableTranshipmentPort
        ? Number(form.transhipmentAgentId)
        : null,
      slotRate: ensureString(form.slotRate),
      depotAvgCost: ensureString(form.depotAvgCost),
      leasingCost: form.leasingCost ?? "",
      depotCleaningCost: ensureString(form.depotCleaningCost) ?? "",
      terminalHandlingFee: ensureString(form.terminalHandlingFee),
      containerPreparationCost: form.containerPreparationCost || "",
      expAgencyCommission: ensureString(form.expAgencyCommission),
      impAgencyCommission: ensureString(form.impAgencyCommission),
      expCollectionCharges: ensureString(form.expCollection) ?? "",
      impCollectionCharges: ensureString(form.impCollection),
      totalCost: ensureString(form.totalCost),
      sellingAmount: ensureString(form.sellingAmount),
      totalRevenueAmount: form.totalRevenueAmount,
      totalPLAmount: form.totalPLAmount,
      plMargin: ensureString(form.plMargin),
    };

    try {
      const method = form.id ? "PATCH" : "POST";
      const url = form.id
        ? `http://128.199.19.28:8000/quotations/${form.id}`
        : "http://128.199.19.28:8000/quotations";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save quotation");

      const result = await res.json();
      fetchQuotations?.(); // Optional: Refresh parent data
      onClose();
    } catch (err) {
      console.error("Error submitting quotation:", err);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://128.199.19.28:8000/addressbook");
        const data = await res.json();
        const customers = data.filter(
          (entry: any) =>
            entry.businessType &&
            entry.businessType.includes("Customer")
        );
        setCustomerSuggestions(customers);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    // Set default form values if creating a new quote
    if (!form.id) {
      setForm((prev: any) => ({
        ...prev,
        effectiveDate: prev.effectiveDate || formatDate(today),
        validTillDate: prev.validTillDate || formatDate(sevenDaysLater),
      }));
    }

    const fetchNextRef = async () => {
      try {
        if (!form.quotationRef) {
          const res = await fetch("http://128.199.19.28:8000/quotations/next-ref");
          const data = await res.json();
          setForm((prev: any) => ({
            ...prev,
            quotationRef: data.quotationRefNumber,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch quotation ref:", error);
      }
    };

    fetchNextRef();
  }, []);

  const fetchProducts = async (searchTerm: string) => {
    try {
      const res = await fetch("http://128.199.19.28:8000/products");
      const data = await res.json();

      const filtered = data.filter((product: any) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProductSuggestions(filtered);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchPorts = async (searchTerm: string) => {
    try {
      const res = await fetch("http://128.199.19.28:8000/ports");
      const data = await res.json();

      const filtered = data.filter((port: any) =>
        port.portName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPortSuggestions(filtered);
    } catch (error) {
      console.error("Error fetching ports:", error);
    }
  };

  const fetchExpDepotsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://128.199.19.28:8000/addressbook");
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

      setExpDepots(filtered);
    } catch (err) {
      console.error("Failed to fetch Exp. Depots:", err);
    }
  };

  useEffect(() => {
    if (form.portOfLoadingId) {
      fetchExpDepotsByPort(form.portOfLoadingId);
    } else {
      setExpDepots([]);
    }
  }, [form.portOfLoadingId]);

  const fetchEmptyReturnDepotsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://128.199.19.28:8000/addressbook");
      const data = await res.json();

      const filtered = data.filter((entry: any) => {
        const businessType = (entry.businessType || "").toLowerCase();
        const isDepotOrCY =
          businessType.includes("deport terminal") || businessType.includes("cy terminal");

        const linkedToPort =
          Array.isArray(entry.businessPorts) &&
          entry.businessPorts.some((bp: any) => bp.portId === portId);

        return isDepotOrCY && linkedToPort;
      });

      setEmptyReturnDepots(filtered);
    } catch (err) {
      console.error("Failed to fetch empty return depots:", err);
    }
  };




  useEffect(() => {
    if (form.portOfDischargeId) {
      fetchEmptyReturnDepotsByPort(form.portOfDischargeId);
    } else {
      setEmptyReturnDepots([]);
    }
  }, [form.portOfDischargeId]);

  const fetchExpHandlingAgentsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://128.199.19.28:8000/addressbook");
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
    }
  };

  useEffect(() => {
    if (form.portOfLoadingId) {
      fetchExpHandlingAgentsByPort(form.portOfLoadingId);
    } else {
      setExpAgents([]);
    }
  }, [form.portOfLoadingId]);

  const fetchImpHandlingAgentsByPort = async (portId: number) => {
    try {
      const res = await fetch("http://128.199.19.28:8000/addressbook");
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
    }
  };
  useEffect(() => {
    if (form.portOfDischargeId) {
      fetchImpHandlingAgentsByPort(form.portOfDischargeId);
    } else {
      setImpHandlingAgents([]);
    }
  }, [form.portOfDischargeId]);

  const fetchTranshipmentPorts = async (search: string) => {
    try {
      const res = await fetch(`http://128.199.19.28:8000/ports`);
      const data = await res.json();
      const filtered = data.filter((p: any) =>
        p.portName.toLowerCase().includes(search.toLowerCase())
      );
      setTranshipmentPortSuggestions(filtered);
    } catch (err) {
      console.error("Failed to fetch transhipment ports:", err);
    }
  };
  const fetchTrsHandlingAgents = async (portId: number) => {
    try {
      const res = await fetch("http://128.199.19.28:8000/addressbook");
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

      setTrsHandlingAgents(filtered);
    } catch (err) {
      console.error("Failed to fetch TRS H. Agents:", err);
    }
  };
  useEffect(() => {
    if (form.enableTranshipmentPort && form.transhipmentPortId) {
      fetchTrsHandlingAgents(form.transhipmentPortId);
    } else {
      setTrsHandlingAgents([]);
    }
  }, [form.transhipmentPortId, form.enableTranshipmentPort]);

  const calculateLeasingCost = async (product: any) => {
    try {
      const res = await fetch("http://128.199.19.28:8000/container-lease-tariff");
      const data = await res.json();

      const matchedTariff = data.find((t: any) =>
        t.containerCategory === product.containerCategory &&
        t.containerType === product.containerType &&
        t.containerClass === product.classType
      );

      if (!matchedTariff) {
        console.warn("No lease tariff matched.");
        return;
      }

      const leasePerDay = parseFloat(matchedTariff.leaseRentPerDay || "0");

      const exp = parseInt(form.expFreeDays || "0");
      const imp = parseInt(form.impFreeDays || "0");
      const transit = parseInt(form.transitDays || "0");

      const totalDays = exp + imp + transit;
      const leasingCost = leasePerDay * totalDays;

      setForm((prev: any) => ({
        ...prev,
        leasingCost: leasingCost.toFixed(2),
      }));
    } catch (err) {
      console.error("Error fetching lease tariff:", err);
    }
  };

  useEffect(() => {
    const parse = (val: string) => parseFloat(val) || 0;

    const totalCost =
      parse(form.slotRate) +
      parse(form.depotAvgCost) +
      parse(form.leasingCost) +
      parse(form.depotCleaningCost) +
      parse(form.terminalHandlingFee) +
      parse(form.containerPreparationCost) +
      parse(form.expAgencyCommission) +
      parse(form.impAgencyCommission);

    const selling = parse(form.sellingAmount);
    const expCollection = parse(form.expCollection);
    const impCollection = parse(form.impCollection);

    const totalRevenue = selling + expCollection + impCollection;
    const totalPL = selling - totalCost;
    const plMargin = selling ? ((totalPL / selling) * 100).toFixed(2) : '0';

    setForm((prev: any) => ({
      ...prev,
      totalCost: totalCost.toFixed(2),
      totalRevenueAmount: totalRevenue.toFixed(2),
      totalPLAmount: totalPL.toFixed(2),
      plMargin,
    }));
  }, [
    form.slotRate,
    form.depotAvgCost,
    form.leasingCost,
    form.depotCleaningCost,
    form.terminalHandlingFee,
    form.containerPreparationCost,
    form.expAgencyCommission,
    form.impAgencyCommission,
    form.sellingAmount,
    form.expCollection,
    form.impCollection,
  ]);



  useEffect(() => {
    const recalcIfApplicable = async () => {
      if (
        form.productCategory === "Tank" &&
        form.productType === "ISO Tank" &&
        form.productClass === "T11"
      ) {
        const product = {
          containerCategory: form.productCategory,
          containerType: form.productType,
          classType: form.productClass,
        };
        calculateLeasingCost(product);
      }
    };

    recalcIfApplicable();
  }, [form.expFreeDays, form.impFreeDays, form.transitDays]);

  useEffect(() => {
    setForm((prev: any) => ({ ...prev, leasingCost: "" }));

  }, [form.productId]);



  useEffect(() => {
    const { productId, portOfDischargeId, emptyReturnDepot } = form;

    // If any of the required values are missing, reset depotCleaningCost
    if (!productId || !portOfDischargeId || !emptyReturnDepot) {
      setForm((prev: any) => ({
        ...prev,
        depotCleaningCost: "",
      }));
      return;
    }


    const calculateDepotCleaningCost = async () => {
      const { productId, portOfDischargeId, emptyReturnDepot } = form;

      if (!productId || !portOfDischargeId || !emptyReturnDepot) return;

      try {
        const [res, exchangeRes] = await Promise.all([
          fetch("http://128.199.19.28:8000/depot-cleaning-tariff-cost"),
          fetch("http://128.199.19.28:8000/exchange-rates"),
        ]);

        const [data, exchangeRateData] = await Promise.all([
          res.json(),
          exchangeRes.json(),
        ]);

        const matched = data.find((item: any) =>
          Number(item.productId) === Number(productId) &&
          Number(item.portId) === Number(portOfDischargeId) &&
          Number(item.addressBookId) === Number(emptyReturnDepot)
        );

        if (matched) {
          const total = parseFloat(matched.cleaningCharges || "0");
          const currencyId = matched.currencyId;

          const exchange = exchangeRateData.find(
            (rate: any) => Number(rate.fromCurrencyId) === Number(currencyId)
          );

          const rate = exchange ? parseFloat(exchange.exchangeRate || "1") : 1;
          const variance = exchange ? parseFloat(exchange.variance || "0") : 0;
          const adjustedRate = rate + (rate * variance / 100);

          const finalCleaningCost = total * adjustedRate;

          setForm((prev: any) => ({
            ...prev,
            depotCleaningCost: finalCleaningCost.toFixed(2),
          }));
        } else {
          setForm((prev: any) => ({
            ...prev,
            depotCleaningCost: "",
          }));
          console.warn("No depot cleaning cost matched.");
        }
      } catch (err) {
        console.error("Error fetching depot cleaning cost:", err);
        setForm((prev: any) => ({
          ...prev,
          depotCleaningCost: "",
        }));
      }
    };

    calculateDepotCleaningCost();
  }, [form.productId, form.portOfDischargeId, form.emptyReturnDepot]);


  useEffect(() => {
    const fetchDepotAvgTariff = async () => {
      try {
        const [tariffRes, currencyRes, exchangeRateRes] = await Promise.all([
          fetch("http://128.199.19.28:8000/depot-avg-tariff"),
          fetch("http://128.199.19.28:8000/currency"),
          fetch("http://128.199.19.28:8000/exchange-rates"),
        ]);

        const [tariffData, currencyData, exchangeRateData] = await Promise.all([
          tariffRes.json(),
          currencyRes.json(),
          exchangeRateRes.json(),
        ]);

        const getAdjustedTotal = (portId: number, depotId: number) => {
          const match = tariffData.find(
            (item: any) =>
              Number(item.portId) === Number(portId) &&
              Number(item.addressBookId) === Number(depotId)
          );

          if (!match) return 0;

          const total = parseFloat(match.total || "0");
          const currencyId = match.currencyId;

          const exchange = exchangeRateData.find(
            (rate: any) => Number(rate.fromCurrencyId) === Number(currencyId)
          );

          if (!exchange) return total;

          const rate = parseFloat(exchange.exchangeRate || "1");
          const variance = parseFloat(exchange.variance || "0");
          const adjustedRate = rate + (rate * variance / 100);

          return total * adjustedRate;
        };

        // Guard clause to prevent running with incomplete data
        if (!form.portOfDischargeId || !form.emptyReturnDepot) return;

        // Only use POD (port of discharge) and its depot
        const total2 = getAdjustedTotal(form.portOfDischargeId, form.emptyReturnDepot);

        setForm((prev: any) => ({
          ...prev,
          depotAvgCost: total2.toFixed(2),
        }));
      } catch (err) {
        console.error("Failed to fetch depot avg tariff:", err);
        setForm((prev: any) => ({
          ...prev,
          depotAvgCost: "",
        }));
      }
    };

    fetchDepotAvgTariff(); // ✅ Now it's inside useEffect
  }, [
    form.portOfDischargeId,
    form.emptyReturnDepot,
  ]);


  useEffect(() => {
    // Special handling for edit mode to load all dependent data
    if (form.isEditing) {
      // Load customer suggestions
      if (form.customerId) {
        fetch("http://128.199.19.28:8000/addressbook")
          .then(res => res.json())
          .then(data => {
            const customers = data.filter(
              (entry: any) => entry.businessType && entry.businessType.includes("Customer")
            );
            setCustomerSuggestions(customers);
          });
      }

      // Load product data
      if (form.productId) {
        fetchProducts(form.productName || '');
      }

      // Load port data and related entities
      if (form.portOfLoadingId) {
        fetchPorts(form.portOfLoading || '');
        fetchExpDepotsByPort(Number(form.portOfLoadingId));
        fetchExpHandlingAgentsByPort(Number(form.portOfLoadingId));
      }

      if (form.portOfDischargeId) {
        fetchPorts(form.portOfDischarge || '');
        fetchEmptyReturnDepotsByPort(Number(form.portOfDischargeId));
        fetchImpHandlingAgentsByPort(Number(form.portOfDischargeId));
      }

      // Load transhipment data if applicable
      if (form.enableTranshipmentPort && form.transhipmentPortId) {
        fetchTranshipmentPorts(form.transhipmentPortName || '');
        fetchTrsHandlingAgents(Number(form.transhipmentPortId));
      }

      if (form.product) {
        calculateLeasingCost(form.product);
      }

    }
  }, [form.isEditing]); // Only run when isEditing changes

  useEffect(() => {
    const fetchExpAgencyCommission = async () => {
      const portId = form.portOfLoadingId;
      const addressBookId = form.expHAgentId;

      if (!portId || !addressBookId) {
        setForm((prev: any) => ({
          ...prev,
          expAgencyCommission: "",
        }));
        return;
      }

      try {
        const [res, exchangeRes] = await Promise.all([
          fetch("http://128.199.19.28:8000/handling-agent-tariff-cost"),
          fetch("http://128.199.19.28:8000/exchange-rates"),
        ]);

        const [data, exchangeRateData] = await Promise.all([
          res.json(),
          exchangeRes.json(),
        ]);

        const matched = data.find(
          (item: any) =>
            Number(item.portId) === Number(portId) &&
            Number(item.addressBookId) === Number(addressBookId)
        );

        if (matched && matched.expCommission) {
          const total = parseFloat(matched.expCommission || "0");
          const currencyId = matched.currencyId;

          const exchange = exchangeRateData.find(
            (rate: any) => Number(rate.fromCurrencyId) === Number(currencyId)
          );

          const rate = exchange ? parseFloat(exchange.exchangeRate || "1") : 1;
          const variance = exchange ? parseFloat(exchange.variance || "0") : 0;
          const adjustedRate = rate + (rate * variance / 100);

          const finalCommission = total * adjustedRate;

          setForm((prev: any) => ({
            ...prev,
            expAgencyCommission: finalCommission.toFixed(2),
          }));
        } else {
          setForm((prev: any) => ({
            ...prev,
            expAgencyCommission: "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch exp commission:", error);
        setForm((prev: any) => ({
          ...prev,
          expAgencyCommission: "",
        }));
      }
    };

    fetchExpAgencyCommission();
  }, [form.portOfLoadingId, form.expHAgentId]);


  useEffect(() => {
    const fetchImpAgencyCommission = async () => {
      const portId = form.portOfDischargeId;
      const addressBookId = form.impHAgentId;

      if (!portId || !addressBookId) {
        setForm((prev: any) => ({
          ...prev,
          impAgencyCommission: "",
        }));
        return;
      }

      try {
        const [res, exchangeRes] = await Promise.all([
          fetch("http://128.199.19.28:8000/handling-agent-tariff-cost"),
          fetch("http://128.199.19.28:8000/exchange-rates"),
        ]);

        const [data, exchangeRateData] = await Promise.all([
          res.json(),
          exchangeRes.json(),
        ]);

        const matched = data.find(
          (item: any) =>
            Number(item.portId) === Number(portId) &&
            Number(item.addressBookId) === Number(addressBookId)
        );

        if (matched && matched.impCommission) {
          const total = parseFloat(matched.impCommission || "0");
          const currencyId = matched.currencyId;

          const exchange = exchangeRateData.find(
            (rate: any) => Number(rate.fromCurrencyId) === Number(currencyId)
          );

          const rate = exchange ? parseFloat(exchange.exchangeRate || "1") : 1;
          const variance = exchange ? parseFloat(exchange.variance || "0") : 0;
          const adjustedRate = rate + (rate * variance / 100);

          const finalCommission = total * adjustedRate;

          setForm((prev: any) => ({
            ...prev,
            impAgencyCommission: finalCommission.toFixed(2),
          }));
        } else {
          setForm((prev: any) => ({
            ...prev,
            impAgencyCommission: "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch imp commission:", error);
        setForm((prev: any) => ({
          ...prev,
          impAgencyCommission: "",
        }));
      }
    };

    fetchImpAgencyCommission();
  }, [form.portOfDischargeId, form.impHAgentId]);



  useEffect(() => {
    // Fetch all products once for use in leasing calculation
    const fetchAllProducts = async () => {
      try {
        const res = await fetch("http://128.199.19.28:8000/products");
        const data = await res.json();
        setProductList(data);
      } catch (error) {
        console.error("Failed to fetch product list:", error);
        setProductList([]);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (
      form.isEditing &&
      form.productId &&
      form.expFreeDays !== undefined &&
      form.impFreeDays !== undefined &&
      form.transitDays !== undefined &&
      productList.length > 0
    ) {
      const product = productList.find(p => p.id === Number(form.productId));
      if (product) {
        calculateLeasingCost(product);
      } else {
        console.warn("Product not found for leasing calculation.");
      }
    }
  }, [form.isEditing, form.productId, form.expFreeDays, form.impFreeDays, form.transitDays, productList]);



  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-lg shadow-lg w-[1200px] max-h-[90vh] overflow-y-auto border border-neutral-800">
        <div className="flex justify-between items-center px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-white">{formTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        <form
          className="px-6 pb-6 pt-2"
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Status */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white">Status</span>
              <input
                type="checkbox"
                checked={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.checked })}
                className="accent-orange-400 w-4 h-4"
                id="status"
              />
              <label htmlFor="status" className="text-white text-sm">
                Active
              </label>
            </div>
            <div></div>

            {/* Quotation Ref No. */}
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">
                Quotation Ref No.
              </label>
              <input
                type="text"
                value={form.quotationRef || ""}
                readOnly
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              />
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={form.effectiveDate || ""}
                onChange={(e) =>
                  setForm({ ...form, effectiveDate: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              />
            </div>

            {/* Valid Till */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Valid Till
              </label>
              <input
                type="date"
                value={form.validTillDate || ""}
                onChange={(e) =>
                  setForm({ ...form, validTillDate: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              />
            </div>

            {/* Shipping Term */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Shipping Term
              </label>
              <select
                value={form.shippingTerm}
                onChange={(e) =>
                  setForm({ ...form, shippingTerm: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              >
                <option value="">Select Term</option>
                <option value="CY-CY">CY-CY</option>
                <option value="CY-Door">CY-Door</option>
                <option value="Door-CY">Door-CY</option>
                <option value="Door-Door">Door-Door</option>
                <option value="EX-WORK-CY">EX-WORK-CY</option>
                <option value="EX-WORK-DOOR">EX-WORK-DOOR</option>
              </select>
            </div>

            {/* Customer Name */}
            <div className="relative">
              <label className="block text-sm text-gray-400 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={form.customerName || ""}
                onChange={(e) => {
                  setForm((prev: any) => ({
                    ...prev,
                    customerName: e.target.value,
                    customerId: null,
                  }));
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                placeholder="Start typing customer name..."
              />
              {showSuggestions && form.customerName && (
                <ul className="absolute z-10 w-full bg-neutral-900 border border-neutral-800 rounded mt-1 max-h-40 overflow-y-auto">
                  {customerSuggestions
                    .filter((c) =>
                      c.companyName
                        .toLowerCase()
                        .includes(form.customerName.toLowerCase())
                    )
                    .map((company) => (
                      <li
                        key={company.id}
                        onMouseDown={() => {
                          setForm((prev: any) => ({
                            ...prev,
                            customerName: company.companyName,
                            customerId: company.id,
                          }));
                          setShowSuggestions(false);
                        }}
                        className="px-3 py-1 hover:bg-neutral-800 cursor-pointer text-sm text-white"
                      >
                        {company.companyName}
                      </li>
                    ))}
                  {customerSuggestions.filter((c) =>
                    c.companyName.toLowerCase().includes(form.customerName?.toLowerCase())
                  ).length === 0 && (
                      <li className="px-3 py-1 text-gray-400 text-sm">No match found</li>
                    )}
                </ul>
              )}
            </div>

            {/* Billing Party */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Billing Party
              </label>
              <select
                value={form.billingParty}
                onChange={(e) =>
                  setForm({ ...form, billingParty: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              >
                <option value="">Select</option>
                <option value="Freight Forwarder">Freight Forwarder</option>
                <option value="Shipper">Shipper</option>
              </select>
            </div>

            {/* Rate Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Rate Type
              </label>
              <select
                value={form.rateType}
                onChange={(e) => setForm({ ...form, rateType: e.target.value })}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              >
                <option value="">Select</option>
                <option value="Tender">Tender</option>
                <option value="Spot">Spot</option>
              </select>
            </div>

            {/* Billing Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Billing Type
              </label>
              <select
                value={form.billingType}
                onChange={(e) =>
                  setForm({ ...form, billingType: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              >
                <option value="">Select</option>
                <option value="Ocean Freight">Ocean Freight</option>
                <option value="Rental">Rental</option>
              </select>
            </div>

            {/* Product Name */}
            <div className="relative">
              <label className="block text-sm text-gray-400 mb-1">Product Name</label>
              <input
                type="text"
                value={form.productName || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev: any) => ({
                    ...prev,
                    productName: value,
                    productId: undefined,
                  }));

                  if (value.length > 1) {
                    fetchProducts(value);
                    setShowProductDropdown(true);
                  } else {
                    setShowProductDropdown(false);
                    setProductSuggestions([]);
                  }
                }}
                onFocus={() => {
                  if (form.productName?.length > 1) {
                    fetchProducts(form.productName);
                    setShowProductDropdown(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowProductDropdown(false), 100);
                }}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                placeholder="Start typing product name..."
              />

              {showProductDropdown && productSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-neutral-900 border border-neutral-800 rounded mt-1 max-h-40 overflow-y-auto">
                  {productSuggestions.map((product) => (
                    <li
                      key={product.id}
                      onMouseDown={async () => {
                        const updatedForm = {
                          ...form,
                          productName: `${product.productId} - ${product.productName} - ${product.productType}`,
                          productId: product.id,
                          productCategory: product.containerCategory,
                          productType: product.containerType,
                          productClass: product.classType,
                        };

                        setForm(updatedForm);
                        setShowProductDropdown(false);

                        try {
                          const res = await fetch("http://128.199.19.28:8000/container-lease-tariff");
                          const leaseTariffs = await res.json();

                          const matchedLease = leaseTariffs.find(
                            (lease: any) =>
                              lease.containerCategory === product.containerCategory &&
                              lease.containerType === product.containerType &&
                              lease.containerClass === product.classType
                          );

                          if (matchedLease) {
                            const exp = parseInt(form.expFreeDays || "0", 10);
                            const imp = parseInt(form.impFreeDays || "0", 10);
                            const transit = parseInt(form.transitDays || "0", 10);
                            const rent = parseFloat(matchedLease.leaseRentPerDay || "0");

                            const leasingCost = (exp + imp + transit) * rent;

                            setForm((prev: any) => ({
                              ...prev,
                              leasingCost: leasingCost.toFixed(2),
                            }));
                          } else {
                            setForm((prev: any) => ({
                              ...prev,
                              leasingCost: "",
                            }));
                          }
                        } catch (error) {
                          console.error("Failed to fetch container lease tariff:", error);
                        }
                      }}
                      className="px-3 py-1 hover:bg-neutral-800 cursor-pointer text-sm text-white"
                    >
                      {`${product.productId} - ${product.productName} - ${product.productType}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <hr className="border-t border-gray-600 my-4 col-span-2" />

            {/* Port Of Loading */}
            <div className="relative">
              <label className="block text-sm text-gray-400 mb-1">
                Port Of Loading
              </label>
              <input
                type="text"
                value={form.portOfLoading || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev: any) => ({
                    ...prev,
                    portOfLoading: value,
                    portOfLoadingId: undefined, // reset on change
                  }));

                  if (value.length > 1) {
                    fetchPorts(value);
                    setShowPortDropdown(true);
                  } else {
                    setShowPortDropdown(false);
                    setPortSuggestions([]);
                  }
                }}
                onFocus={() => {
                  if (form.portOfLoading?.length > 1) {
                    fetchPorts(form.portOfLoading);
                    setShowPortDropdown(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowPortDropdown(false), 100);
                }}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                placeholder="Start typing port of loading..." />

              {showPortDropdown && portSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-neutral-900 border text-white border-neutral-800 rounded mt-1 max-h-40 overflow-y-auto">
                  {portSuggestions.map((port) => (
                    <li
                      key={port.id}
                      onMouseDown={() => {
                        setForm((prev: any) => ({
                          ...prev,
                          portOfLoading: port.portName,
                          portOfLoadingId: port.id,
                        }));
                        setShowPortDropdown(false);
                      }}
                      className="px-3 py-1 hover:bg-neutral-800 cursor-pointer text-sm text-white"
                    >
                      {port.portName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Port Of Discharge */}
            <div className="relative">
              <label className="block text-sm text-gray-400 mb-1">
                Port Of Discharge
              </label>
              <input
                type="text"
                value={form.portOfDischarge || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev: any) => ({
                    ...prev,
                    portOfDischarge: value,
                    portOfDischargeId: undefined,
                  }));

                  if (value.length > 1) {
                    fetchPorts(value);
                    setShowDischargeDropdown(true);
                  } else {
                    setShowDischargeDropdown(false);
                  }
                }}
                onFocus={() => {
                  if (form.portOfDischarge?.length > 1) {
                    fetchPorts(form.portOfDischarge);
                    setShowDischargeDropdown(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowDischargeDropdown(false), 100);
                }}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                placeholder="Start typing port of discharge..."
              />

              {showDischargeDropdown && portSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-neutral-900 border text-white border-neutral-800 rounded mt-1 max-h-40 overflow-y-auto">
                  {portSuggestions.map((port) => (
                    <li
                      key={port.id}
                      onMouseDown={() => {
                        setForm((prev: any) => ({
                          ...prev,
                          portOfDischarge: port.portName,
                          portOfDischargeId: port.id,
                        }));
                        setShowDischargeDropdown(false);
                      }}
                      className="px-3 py-1 hover:bg-neutral-800 cursor-pointer text-sm text-white"
                    >
                      {port.portName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Free Days and Detention Rate */}
            <div className="flex w-full gap-4 col-span-2">
              <div className="flex-5">
                <label className="block text-sm text-gray-400 mb-1">
                  Free Days
                </label>
                <input
                  type="text"
                  value={form.expFreeDays}
                  onChange={(e) =>
                    setForm({ ...form, expFreeDays: e.target.value })
                  }
                  className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                />
              </div>

              <div className="flex-5 gap-1">
                <label className="block text-sm text-gray-400 mb-1">
                  Detention Rate
                </label>
                <input
                  type="text"
                  value={form.expDetentionRate}
                  onChange={(e) =>
                    setForm({ ...form, expDetentionRate: e.target.value })
                  }
                  className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                />
              </div>

              <div className="flex-5">
                <label className="block text-sm text-gray-400 mb-1">
                  Free Days
                </label>
                <input
                  type="text"
                  value={form.impFreeDays}
                  onChange={(e) =>
                    setForm({ ...form, impFreeDays: e.target.value })
                  }
                  className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                />
              </div>

              <div className="flex-5">
                <label className="block text-sm text-gray-400 mb-1">
                  Detention Rate
                </label>
                <input
                  type="text"
                  value={form.impDetentionRate}
                  onChange={(e) =>
                    setForm({ ...form, impDetentionRate: e.target.value })
                  }
                  className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                />
              </div>
            </div>

            {/* Exp. Depot Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Exp. Depot Name
              </label>
              <select
                value={form.expDepotId || ""}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const selectedDepot = expDepots.find((d: any) => d.id === selectedId);
                  setForm({
                    ...form,
                    expDepotId: selectedId,
                    expDepotName: selectedDepot?.companyName || "",
                  });
                }}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              >
                <option value="">First Select Port of Loading</option>
                {expDepots.map((depot: any) => (
                  <option key={depot.id} value={depot.id}>
                    {depot.companyName} - {depot.businessType}
                  </option>
                ))}
              </select>
            </div>


            {/* Empty Return Depot */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Empty Return Depot
              </label>

              <select
                value={form.emptyReturnDepot || ""}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const selectedDepot = emptyReturnDepots.find((d) => d.id === selectedId);
                  setForm({
                    ...form,
                    emptyReturnDepot: selectedId,
                    emptyReturnDepotName: selectedDepot?.companyName || "",
                  });
                }}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              >
                <option value="">First Select Port of Discharge</option>
                {emptyReturnDepots.map((depot: any) => (
                  <option key={depot.id} value={depot.id}>
                    {depot.companyName} - {depot.businessType}
                  </option>
                ))}
              </select>
            </div>



            {/* Exp. H. Agent Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Exp. H. Agent Name
              </label>
              <select
                value={form.expHAgentId || ""}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const selected = expAgents.find((a: any) => a.id === selectedId);
                  setForm({
                    ...form,
                    expHAgentId: selectedId,
                    expHAgentName: selected?.companyName || "",
                  });
                }}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              >
                <option value="">Select</option>
                {expAgents.map((agent: any) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.companyName}
                  </option>
                ))}
              </select>

            </div>


            {/* Imp. H. Agent Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Imp. H. Agent Name
              </label>
              <select
                value={form.impHAgentId || ""}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const selected = impHandlingAgents.find((a: any) => a.id === selectedId);
                  setForm({
                    ...form,
                    impHAgentId: selectedId,
                    impHAgentName: selected?.companyName || "",
                  });
                }}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              >

                <option value="">Select</option>
                {impHandlingAgents.map((agent: any) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.companyName}
                  </option>
                ))}
              </select>

            </div>

            <hr className="border-t border-gray-600 my-4 col-span-2" />

            {/* Transit Days */}
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">
                Transit Days
              </label>
              <input
                type="text"
                value={form.transitDays}
                onChange={(e) =>
                  setForm({ ...form, transitDays: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              />
            </div>

            {/* Enable Transhipment Port */}
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.enableTranshipmentPort ?? false}
                onChange={(e) =>
                  setForm({ ...form, enableTranshipmentPort: e.target.checked })
                }
                className="accent-orange-400 w-4 h-4"
                id="enableTranshipmentPort"
              />

              <label
                htmlFor="enableTranshipmentPort"
                className="text-white text-sm"
              >
                Enable Transhipment Port
              </label>
            </div>

            {form.enableTranshipmentPort && (
              <>
                {/* Transhipment Port */}
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">
                    Transhipment Port
                  </label>
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      value={form.transhipmentPortName || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((prev: any) => ({
                          ...prev,
                          transhipmentPortName: value,
                          transhipmentPortId: undefined,
                        }));

                        if (value.length > 1) {
                          fetchTranshipmentPorts(value);
                          setShowTranshipmentDropdown(true);
                        } else {
                          setShowTranshipmentDropdown(false);
                        }
                      }}
                      onFocus={() => {
                        if ((form.transhipmentPortName || "").length > 1) {
                          fetchTranshipmentPorts(form.transhipmentPortName || "");
                          setShowTranshipmentDropdown(true);
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowTranshipmentDropdown(false), 150)}
                      className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                      placeholder="Start typing transhipment port..."
                    />
                    {showTranshipmentDropdown && transhipmentPortSuggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-neutral-900 border text-white border-neutral-800 rounded mt-1 max-h-40 overflow-y-auto">
                        {transhipmentPortSuggestions.map((port) => (
                          <li
                            key={port.id}
                            onMouseDown={() => {
                              setForm((prev: any) => ({
                                ...prev,
                                transhipmentPortName: port.portName,
                                transhipmentPortId: port.id,
                              }));
                              setShowTranshipmentDropdown(false);
                            }}
                            className="px-3 py-1 hover:bg-neutral-800 cursor-pointer text-sm text-white"
                          >
                            {port.portName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* TRS. H. Agent Name */}
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">
                    TRS. H. Agent Name
                  </label>
                  <div className="w-1/2">
                    <select
                      value={form.transhipmentAgentId || ""}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selected = trsHandlingAgents.find(a => a.id === selectedId);
                        setForm({
                          ...form,
                          transhipmentAgentId: selectedId,
                          transhipmentAgentName: selected?.companyName || "",
                        });
                      }}
                      className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                    >
                      <option value="">Select</option>
                      {trsHandlingAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </>
            )}

            <hr className="border-t border-gray-600 my-4 col-span-2" />

            {/* Financial Details */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Slot Rate
              </label>
              <Input
                type="text"
                value={form.slotRate ?? ""}
                onChange={(e) => setForm({ ...form, slotRate: e.target.value })}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Depot Avg Cost
              </label>
              <Input
                type="text"
                value={form.depotAvgCost ?? ""}
                readOnly
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                placeholder={form.isEditing ? "" : "Auto-calculated"}
              />
            </div>


            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Leasing Cost
              </label>
              <input
                type="text"
                value={form.leasingCost ?? ""}
                readOnly
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800 bg-opacity-70 cursor-not-allowed"
                placeholder={form.isEditing ? "" : "Auto-calculated"}
              />
            </div>


            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Depot Cleaning Cost
              </label>
              <input
                type="text"
                value={form.depotCleaningCost ?? ""}
                onChange={(e) => setForm({ ...form, depotCleaningCost: e.target.value })}
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                placeholder={form.isEditing ? "" : "Auto-calculated"}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Terminal Handling Fee
              </label>
              <input
                type="text"
                value={form.terminalHandlingFee ?? ""}
                onChange={(e) =>
                  setForm({ ...form, terminalHandlingFee: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Container Preparation
              </label>
              <input
                type="text"
                value={form.containerPreparationCost ?? ""}
                onChange={(e) =>
                  setForm({ ...form, containerPreparationCost: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              />
            </div>

            <hr className="border-t border-gray-600 my-4 col-span-2" />



            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Exp. Agency Commission
              </label>
              <input
                type="text"
                value={form.expAgencyCommission ?? ""}
                onChange={(e) =>
                  setForm({ ...form, expAgencyCommission: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                readOnly
                placeholder={form.isEditing ? "" : "Auto-calculated"}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Imp. Agency Commission
              </label>
              <input
                type="text"
                value={form.impAgencyCommission ?? ""}
                onChange={(e) =>
                  setForm({ ...form, impAgencyCommission: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                readOnly
                placeholder={form.isEditing ? "" : "Auto-calculated"}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Exp. Collection
              </label>
              <input
                type="text"
                value={form.expCollection ?? ""}
                onChange={(e) =>
                  setForm({ ...form, expCollection: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"

              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Imp. Collection
              </label>
              <input
                type="text"
                value={form.impCollection ?? ""}
                onChange={(e) =>
                  setForm({ ...form, impCollection: e.target.value })
                }
                className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
              />
            </div>

            <hr className="border-t border-gray-600 my-4 col-span-2" />

            <div className="space-y-4">
              {" "}
              {/* Ensures vertical stacking with spacing */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Total Cost
                </label>
                <input
                  type="text"
                  value={form.totalCost ?? ""}
                  readOnly
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                />
              </div>


              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Selling Amount (Ocean Freight)
                </label>
                <input
                  type="text"
                  value={form.sellingAmount ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, sellingAmount: e.target.value })
                  }
                  className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Total Revenue Amount
                </label>
                <input
                  type="text"
                  value={form.totalRevenueAmount ?? ""}
                  readOnly
                  className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Total P & L
                </label>
                <input
                  type="text"
                  value={form.totalPLAmount ?? ""}
                  readOnly
                  className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  P/L Margin %
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.plMargin ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, plMargin: e.target.value })
                    }
                    className="w-full p-2 bg-neutral-900 text-white rounded border border-neutral-800 pr-6"
                  />
                  <span className="absolute right-2 top-2 text-white">%</span>
                </div>
              </div>
            </div>

            <hr className="border-t border-gray-600 my-4 col-span-2" />

          </div>

          <div className="flex justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 cursor-pointer text-white rounded hover:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuotationModal;