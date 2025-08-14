import jsPDF from "jspdf";
import axios from "axios";
import dayjs from "dayjs";

const ristarLogoBase64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABj 'lines tariff.',AAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAEPA5kDASIAAhEBAxEB/8QAHgABAAICAgMBAAAAAAAAAAAAAAgJBgcBBQIDBAr/xABvEAABAgUCAwUDBQgHDRMJCQEBAgMABAUGEQcIEiExCRNBUWEUInEVIzKBkRVCUmJyobGyCR";

// Define BL types
export type BLType = 'original' | 'draft' | 'seaway';

export interface BLFormData {
  shipmentId: number;
  blType: BLType;
  date: string;
  blNumber: string;
  shipper: string;
  consignee: string;
  notifyParty: string;
  placeOfAcceptance: string;
  portOfLoading: string;
  portOfDischarge: string;
  placeOfDelivery: string;
  vesselVoyageNo: string;
  containerInfo: string;
  marksNumbers: string;
  descriptionOfGoods: string;
  grossWeight: string;
  netWeight: string;
  shippingMarks: string;
  freightCharges: string;
  freightPayableAt: string;
  numberOfOriginals: string;
  placeOfIssue: string;
  dateOfIssue: string;
  containers: any[];
}

function addTextWithSpacing(doc: any, label: string, value: string, x: number, y: number, labelWidth: number = 45) {
  doc.setFont("arial", "bold");
  doc.setFontSize(10);
  doc.text(label, x, y);
  doc.setFont("arial", "normal");
  doc.setFontSize(10);
  doc.text(value, x + labelWidth, y);
}

// Normalize text heading into PDF to avoid odd spacing issues
function normalizePdfText(input: string): string {
  return (input || '')
    .replace(/\u00A0/g, ' ') // non-breaking space
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
    .replace(/[“”]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .replace(/\u2019/g, "'") // smart apostrophe
    .replace(/\u2013/g, "-") // en dash
    .replace(/\u2014/g, "--") // em dash
    .trim(); // remove leading/trailing whitespace
}

// Helper to load an image from public folder as Data URL for jsPDF
async function loadImageAsDataURL(path: string): Promise<string> {
  const res = await fetch(path);
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function generateBlPdf(
  blType: BLType,
  formData: BLFormData,
  blFormData?: any, // Add the BL form data parameter
  copyNumber: number = 0 // Add copy number parameter (0=original, 1=2nd copy, 2=3rd copy)
) {
  // Create PDF with A3 width but increased height for better footer fitting
  const doc = new jsPDF('p', 'mm', [297, 420]); // A3 width (297mm) with increased height

  try {
    // Fetch shipment data for additional info like ports and vessel details
    console.log("Starting BL PDF generation for shipment:", formData.shipmentId);
    const [shipmentRes, addressBooksRes, productsRes] = await Promise.all([
      axios.get(`http://localhost:8000/shipment/${formData.shipmentId}`),
      axios.get(`http://localhost:8000/addressbook`),
      axios.get(`http://localhost:8000/products`),
    ]);

    const shipment = shipmentRes.data;
    const addressBooks = addressBooksRes.data;
    const products = productsRes.data;

    // Use BL form data instead of address book lookups
    const shipper = blFormData ? {
      companyName: blFormData.shippersName,
      address: blFormData.shippersAddress,
      phone: blFormData.shippersContactNo,
      email: blFormData.shippersEmail
    } : {
      companyName: formData.shipper || '',
      address: '',
      phone: '',
      email: ''
    };

    const consignee = blFormData ? {
      companyName: blFormData.consigneeName,
      address: blFormData.consigneeAddress,
      phone: blFormData.consigneeContactNo,
      email: blFormData.consigneeEmail
    } : {
      companyName: formData.consignee || '',
      address: '',
      phone: '',
      email: ''
    };

    const notifyParty = blFormData ? {
      companyName: blFormData.notifyPartyName,
      address: blFormData.notifyPartyAddress,
      phone: blFormData.notifyPartyContactNo,
      email: blFormData.notifyPartyEmail
    } : consignee;

    // Get product information
    const product = products.find((p: any) => p.id === shipment.productId);

    // Format dates - Use the consistent date from formData instead of current date
    const blDate = dayjs(formData.date).format("DD.MM.YYYY");
    const shippedOnboardDate = dayjs(shipment.gsDate).format("DD.MM.YYYY");

    // Derive ports and labels
    const polName = shipment.polPort?.portName || '';
    const podName = shipment.podPort?.portName || '';

    // Container and weights from BL form or shipment
    const containers = shipment.containers || [];
    const sealNumber = blFormData?.sealNo || containers[0]?.sealNumber || '';
    
    // Use weights from BL form if available
    const grossWeight = blFormData ? blFormData.grossWt : formData.grossWeight || '';
    const netWeight = blFormData ? blFormData.netWt : formData.netWeight || '';
    
    // Use delivery agent info from BL form
    const deliveryAgent = blFormData ? {
      name: blFormData.deliveryAgentName,
      address: blFormData.deliveryAgentAddress,
      contactNo: blFormData.deliveryAgentContactNo,
      email: blFormData.deliveryAgentEmail
    } : null;
    
    // Use freight amount from BL form - it's mapped as freightCharges in the pdfData
    const freightAmount = blFormData?.freightAmount || formData?.freightCharges || '';
    
    // Use BL details from form
    const blDetails = blFormData?.billofLadingDetails || '';
    
    const parseWeight = (weightStr: string) => {
      const w = typeof weightStr === 'string' ? weightStr.replace(/[^0-9.]/g, '') : weightStr;
      const n = parseFloat(w || '');
      return isNaN(n) ? null : n;
    };
    
    const grossWeightNum = parseWeight(grossWeight);
    const netWeightNum = parseWeight(netWeight);
    
    const formatKgs = (n: number | null, decimals: number) => {
      if (n === null) return '';
      return new Intl.NumberFormat('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n) + ' KGS';
    };
    
    const grossKgsShort = formatKgs(grossWeightNum, 2);   // e.g., 20,030.00 KGS
    const grossKgsLong = formatKgs(grossWeightNum, 3);    // e.g., 20,030.000 KGS
    const netKgsShort = formatKgs(netWeightNum, 2);
    const netKgsLong = formatKgs(netWeightNum, 3);

    // Set font globally
    doc.setFont("arial");
    // Reset all text spacing and formatting properties to ensure normal rendering
    if ((doc as any).setCharSpace) {
      (doc as any).setCharSpace(0);
    }
    if ((doc as any).setWordSpace) {
      (doc as any).setWordSpace(0);
    }
    if ((doc as any).setTextScale) {
      (doc as any).setTextScale(1);
    }
    // Tighten line height to reduce wasted vertical space
    if ((doc as any).setLineHeightFactor) {
      (doc as any).setLineHeightFactor(1.05);
    }
    
    // Page metrics
    const pageWidth = (doc as any).internal.pageSize.getWidth
      ? (doc as any).internal.pageSize.getWidth()
      : (doc as any).internal.pageSize.width;
    const pageHeight = (doc as any).internal.pageSize.getHeight
      ? (doc as any).internal.pageSize.getHeight()
      : (doc as any).internal.pageSize.height;

    // Calculate margins for centering the content
    const contentWidth = pageWidth - 40; // Reduce content area
    const marginX = (pageWidth - contentWidth) / 2; // Center horizontally
    const marginY = 4; // Top margin reduced to shift content up

    // Main border (centered)
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    // Draw outer border including bottom edge (explicit lines for crisp edges)
    doc.line(marginX, marginY, marginX + contentWidth, marginY); // top
    doc.line(marginX, marginY, marginX, marginY + pageHeight - 30); // left
    doc.line(marginX + contentWidth, marginY, marginX + contentWidth, marginY + pageHeight - 30); // right
    doc.line(marginX, marginY + pageHeight - 30, marginX + contentWidth, marginY + pageHeight - 30); // bottom
    
    // Header big box and split column like first image
    // Move header up to overlap the outer border top (removes the top gap/second line)
    const headerTop = marginY;
    const headerLeft = marginX;
    const headerWidth = contentWidth;
    const headerRightX = headerLeft + headerWidth;
    // helper to scale X positions from 190-wide reference to current header width
    const scaleX = (x: number) => marginX + (x / 190) * headerWidth;
    // Shift split further left to give more space to the right panel
    const headerSplitX = headerLeft + Math.floor(headerWidth * 0.43);

    // We will place text first to compute the required height, then draw the surrounding box
    const leftX = headerLeft + 5;
    const rightX = headerSplitX + 5;
    const leftMaxWidth = headerSplitX - headerLeft - 10;
    const rightMaxWidth = headerRightX - rightX - 5;

    // Left column content with very compact spacing to prevent footer cutoff
    let y = headerTop + 6;
    const sectionPadding = 5; // Reduced title padding
    const fieldSpacing = 3; // Space between fields
    const sectionGap = 3; // Reduced gap between sections
    
    // Much smaller section heights to preserve space for footer
    const shipperMaxHeight = 24; // Significantly reduced
    const consigneeMaxHeight = 24; // Significantly reduced  
    const notifyMaxHeight = 24; // Significantly reduced
    
    // SHIPPER section - very compact
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('SHIPPER', leftX, y);
    y += sectionPadding;
    
    const shipperStartY = y;
    let currentFieldY = y;
    
    // Shipper Name - Bold (only if space available)
    if (shipper?.companyName && currentFieldY < shipperStartY + shipperMaxHeight - 4) {
      doc.setFont('arial', 'bold');
      doc.setFontSize(10);
      const nameLines = doc.splitTextToSize(shipper.companyName, leftMaxWidth);
      doc.text(nameLines[0], leftX, currentFieldY); // Only first line
      currentFieldY += 4;
    }
    
    // Shipper Address - Normal (only if space available)
    if (shipper?.address && currentFieldY < shipperStartY + shipperMaxHeight - 4) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const addressLines = doc.splitTextToSize(shipper.address, leftMaxWidth);
      doc.text(addressLines[0], leftX, currentFieldY); // Only first line
      currentFieldY += 4;
    }
    
    // Shipper Phone - Normal (only if space available)
    if (shipper?.phone && currentFieldY < shipperStartY + shipperMaxHeight - 4) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const telLines = doc.splitTextToSize(`TEL: ${shipper.phone}`, leftMaxWidth);
      doc.text(telLines[0], leftX, currentFieldY);
      currentFieldY += 4;
    }
    
    // Shipper Email - Normal (only if space available)
    if (shipper?.email && currentFieldY < shipperStartY + shipperMaxHeight - 4) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const emailLines = doc.splitTextToSize(`EMAIL: ${shipper.email}`, leftMaxWidth);
      doc.text(emailLines[0], leftX, currentFieldY);
    }
    
    // Fixed shipper underline position
    const shipperUnderlineY = headerTop + 6 + sectionPadding + shipperMaxHeight;
    doc.setLineWidth(0.4);
    // Extend underline fully to the panel borders (no side gaps)
    doc.line(headerLeft, shipperUnderlineY, headerSplitX, shipperUnderlineY);

    // CONSIGNEE section - very compact (shifted slightly down from underline)
    y = shipperUnderlineY + sectionGap + 2;
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Consignee (or order)', leftX, y);
    y += sectionPadding;
    
    const consigneeStartY = y;
    currentFieldY = y;
    
    // Consignee Name - Bold (only if space available)
    if (consignee?.companyName && currentFieldY < consigneeStartY + consigneeMaxHeight - 4) {
      doc.setFont('arial', 'bold');
      doc.setFontSize(10);
      const nameLines = doc.splitTextToSize(consignee.companyName, leftMaxWidth);
      doc.text(nameLines[0], leftX, currentFieldY); // Only first line
      currentFieldY += 4;
    }
    
    // Consignee Address - Normal (only if space available)
    if (consignee?.address && currentFieldY < consigneeStartY + consigneeMaxHeight - 4) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const addressLines = doc.splitTextToSize(consignee.address, leftMaxWidth);
      doc.text(addressLines[0], leftX, currentFieldY); // Only first line
      currentFieldY += 4;
    }
    
    // Consignee Phone - Normal (only if space available)
    if (consignee?.phone && currentFieldY < consigneeStartY + consigneeMaxHeight - 4) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const telLines = doc.splitTextToSize(`TEL: ${consignee.phone}`, leftMaxWidth);
      doc.text(telLines[0], leftX, currentFieldY);
      currentFieldY += 4;
    }
    
    // Consignee Email - Normal (only if space available)
    if (consignee?.email && currentFieldY < consigneeStartY + consigneeMaxHeight - 4) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const emailLines = doc.splitTextToSize(`EMAIL: ${consignee.email}`, leftMaxWidth);
      doc.text(emailLines[0], leftX, currentFieldY);
    }
    
    // Fixed consignee underline position
    const consigneeUnderlineY = shipperUnderlineY + sectionGap + sectionPadding + consigneeMaxHeight;
    // Extend underline fully to the panel borders (no side gaps)
    doc.line(headerLeft, consigneeUnderlineY, headerSplitX, consigneeUnderlineY);

    // NOTIFY PARTY section - very compact (shifted slightly down from underline)
    y = consigneeUnderlineY + sectionGap + 2;
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Notify Party', leftX, y);
    y += sectionPadding;
    
    const notifyStartY = y;
    currentFieldY = y;
    
    // Notify Party Name - Bold (only if space available)
    if (notifyParty?.companyName && currentFieldY < notifyStartY + notifyMaxHeight - 4) {
      doc.setFont('arial', 'bold');
      doc.setFontSize(10);
      const nameLines = doc.splitTextToSize(notifyParty.companyName, leftMaxWidth);
      doc.text(nameLines[0], leftX, currentFieldY); // Only first line
      currentFieldY += 4;
    }
    
    // Notify Party Address - Normal (only if space available)
    if (notifyParty?.address && currentFieldY < notifyStartY + notifyMaxHeight - 4) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const addressLines = doc.splitTextToSize(notifyParty.address, leftMaxWidth);
      doc.text(addressLines[0], leftX, currentFieldY); // Only first line
      currentFieldY += 4;
    }
    
    // Notify Party Phone - Normal (only if space available)
    if (notifyParty?.phone && currentFieldY < notifyStartY + notifyMaxHeight - 4) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const telLines = doc.splitTextToSize(`TEL: ${notifyParty.phone}`, leftMaxWidth);
      doc.text(telLines[0], leftX, currentFieldY);
      currentFieldY += 4;
    }
    
    // Notify Party Email - Normal (only if space available)
    if (notifyParty?.email && currentFieldY < notifyStartY + notifyMaxHeight - 4) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const emailLines = doc.splitTextToSize(`EMAIL: ${notifyParty.email}`, leftMaxWidth);
      doc.text(emailLines[0], leftX, currentFieldY);
    }
    
    // Fixed notify party end position
    const notifyPartyUnderlineY = consigneeUnderlineY + sectionGap + sectionPadding + notifyMaxHeight;
    const leftBottomY = notifyPartyUnderlineY;

    // Right column content: BL number, RISTAR logo, company info, terms paragraph
    let ry = headerTop + 8;
    
    // Get houseBL value for use elsewhere
    const houseBLValue = blFormData?.houseBL || shipment?.houseBL || '';
    
    doc.setFont('arial', 'bold');
    doc.setFontSize(12);
    // Use houseBL as the main BL number if available, otherwise use the generated BL number
    const actualBlNumber = houseBLValue || blFormData?.blNumber || formData?.blNumber || `BL RST/NSADMN/25/${String(formData.shipmentId).padStart(5, '0')}`;
    doc.text(actualBlNumber, rightX, ry);
    ry += 8;
    // Insert company logo image from public folder in marked area - centered horizontally
    try {
      const logoDataUrl = await loadImageAsDataURL('/crologo.jpg');
      const logoMaxWidth = Math.min(rightMaxWidth, 90);
      const aspectRatio = 271 / 921; // based on provided image dimensions
      const logoHeight = logoMaxWidth * aspectRatio;
      // Center the logo horizontally within the right panel
      const logoCenterX = rightX + (rightMaxWidth - logoMaxWidth) / 2;
      doc.addImage(logoDataUrl, 'JPEG', logoCenterX, ry, logoMaxWidth, logoHeight);
      ry += logoHeight + 8;
    } catch (e) {
      // Fallback: keep spacing even if image fails to load
      ry += 22;
    }
    doc.setFont('arial', 'bold');
    doc.setFontSize(12);
    // Center the company name horizontally
    const companyNameCenterX = rightX + rightMaxWidth / 2;
    doc.text('RISTAR LOGISTICS PVT LTD', companyNameCenterX, ry, { align: 'center' });
    doc.setFont('arial', 'bold');
    doc.setFontSize(12); // Increased font size from 10 to 12
    let rLines = doc.splitTextToSize('Office No. C- 0010, Akshar Business Park, Plot No 3, Sector 25, Vashi Navi Mumbai - 400703', rightMaxWidth);
    // Center the address text
    doc.text(rLines, companyNameCenterX, ry + 12, { align: 'center' });
    ry += 6 + rLines.length * 5 + 3;
    doc.setFontSize(9);
    // Terms block with dynamic fitting
    const maxRightTermsY = headerTop + 120; // Maximum Y for right terms to prevent overlap
    const termsBlock = [
      'Taken in charge in apparently good condition herein at the place of receipt for transport and delivery as mentioned above, unless otherwise stated. The MTO in accordance with the provision contained in the MTD undertakes to perform or to procure the performance of the multimodal transport from the place at which the goods are taken in charge, to the place designated for delivery and assumes responsibility for such transport. Once of the MTD(s) must be surrendered, duty endorsed in exchange for the goods. In witness where of the original MTD all of this tenor and date have been signed in the number indicated below one of which accomplished the other(s) to be void.',
    ];
    const termsWrapped = doc.splitTextToSize(termsBlock.join(' '), rightMaxWidth);
    
    // Calculate available space and limit text if needed
    const availableSpace = maxRightTermsY - (ry + 10);
    const maxTermsLines = Math.floor(availableSpace / 3.2);
    const displayedTerms = termsWrapped.slice(0, maxTermsLines);
    
    doc.text(displayedTerms, rightX, ry + 10);
    const rightBottomY = ry + displayedTerms.length * 3.2;
  
    // Determine header height dynamically
    const contentBottomY = Math.max(leftBottomY, rightBottomY);
    const portsTop = contentBottomY + 2; // Reduced from 4 to 2 to shift content up
    const rowH = 10; // Reduced from 12 to 10 to save space
    const portsHeight = rowH * 4; // four stacked rows on left
    const totalHeaderHeight = (portsTop - headerTop) + portsHeight + 2;

    // Draw header box (omit top edge so only the outer border top line is visible)
    doc.setLineWidth(0.5);
    // left edge
    doc.line(headerLeft, headerTop, headerLeft, headerTop + totalHeaderHeight);
    // bottom edge
    doc.line(headerLeft, headerTop + totalHeaderHeight, headerLeft + headerWidth, headerTop + totalHeaderHeight);
    // right edge
    doc.line(headerLeft + headerWidth, headerTop, headerLeft + headerWidth, headerTop + totalHeaderHeight);
    doc.line(headerSplitX, headerTop, headerSplitX, headerTop + totalHeaderHeight);
    // Separator above ports grid (left panel only)
    doc.line(headerLeft, portsTop, headerSplitX, portsTop);

    // Ports labels/values stacked on left; only Port Of Discharge on right row 1
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    const pLeftX = headerLeft + 5;
    const innerSplitX = headerLeft + Math.floor((headerSplitX - headerLeft) / 2);
    const pMidX = innerSplitX + 5; // right side of the left panel
    // Row 1 label/value
    doc.text('Place Of Acceptance', pLeftX, portsTop + 4);
    doc.setFontSize(10);
    doc.setFont('arial', 'normal');
    // Value with generous gap from label and safe distance from bottom rule
    doc.text(polName || '', pLeftX, portsTop + 9);
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Port Of Discharge', pMidX, portsTop + 4);
    doc.setFontSize(10);
    doc.setFont('arial', 'normal');
    doc.text(podName || '', pMidX, portsTop + 9);
    // underline row 1 (only left panel)
    doc.line(headerLeft, portsTop + rowH, headerSplitX, portsTop + rowH);

    // Row 2
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Port Of Loading', pLeftX, portsTop + rowH + 4);
    doc.setFontSize(10);
    doc.setFont('arial', 'normal');
    doc.text(polName || '', pLeftX, portsTop + rowH + 9);
    doc.line(headerLeft, portsTop + rowH * 2, headerSplitX, portsTop + rowH * 2);

    // Row 3
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Place Of Delivery', pLeftX, portsTop + rowH * 2 + 4);
    doc.setFont('arial', 'normal');
    doc.text(podName || '', pLeftX, portsTop + rowH * 2 + 9);
    doc.line(headerLeft, portsTop + rowH * 3, headerSplitX, portsTop + rowH * 3);

    // Row 4
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Vessel & Voyage No.', pLeftX, portsTop + rowH * 3 + 4);
    doc.setFontSize(10);
    doc.setFont('arial', 'normal');
    doc.text(shipment.vesselName || '', pLeftX, portsTop + rowH * 3 + 10);
    // Removed final underline to avoid double line with the header box bottom border

    // Title positioned in right panel above table - moved down slightly
    let yPos = headerTop + totalHeaderHeight + 3;
    const blTitleY = portsTop + rowH * 2 + 12; // Increased from 6 to 12 to move it down more
    doc.setFontSize(18);
    doc.setFont('arial', 'bold');
    // Dynamic BL title based on copy number and type
    let blTypeText = '';
    if (blType === 'original') {
      if (copyNumber === 0) {
        blTypeText = '1st ORIGINAL B/L';
      } else if (copyNumber === 1) {
        blTypeText = '2nd COPY B/L';
      } else if (copyNumber === 2) {
        blTypeText = '3rd COPY B/L';
      }
    } else if (blType === 'draft') {
      if (copyNumber === 0) {
        blTypeText = 'DRAFT B/L';
      } else if (copyNumber === 1) {
        blTypeText = '2nd COPY B/L';
      } else if (copyNumber === 2) {
        blTypeText = '3rd COPY B/L';
      }
    } else if (blType === 'seaway') {
      if (copyNumber === 0) {
        blTypeText = 'SEAWAY B/L';
      } else if (copyNumber === 1) {
        blTypeText = '2nd COPY B/L';
      } else if (copyNumber === 2) {
        blTypeText = '3rd COPY B/L';
      }
    }
    // Move title to the right section centered within the right panel
    const rightPanelCenterX = headerSplitX + (headerRightX - headerSplitX) / 2;
    doc.text(blTypeText, rightPanelCenterX, blTitleY, { align: 'center' });

    // No extra thick separator before the table region (prevents double lines)
    const tableTop = yPos + 6; // Reduced from 10 to 6 to save space
    doc.setLineWidth(1);

    // Table container
    // Place the container headers closer to the header box
    const containerTopY = headerTop + totalHeaderHeight + 1; // Reduced from 2 to 1
    const tableHeaderY = containerTopY + 2; // Reduced from 4 to 2
    doc.setLineWidth(0.5);

    // Headers
    doc.setFontSize(10);
    doc.setFont('arial', 'bold');
    doc.text('Container No.(s)', marginX + 5, tableHeaderY + 2);
    doc.text('Marks and numbers', marginX + 60, tableHeaderY + 2);
    doc.text('Number of packages, kinds of packages;', marginX + 110, tableHeaderY +2);
    doc.text('general description of goods', marginX + 110, tableHeaderY + 6);
    // Removed the Gross/Net Weight header while keeping their values below
    // Add a header underline right below the header row
    doc.setLineWidth(0.6);
    const headerUnderlineY = tableHeaderY + 8; // increased header height for table columns
    doc.line(marginX, headerUnderlineY, marginX + headerWidth, headerUnderlineY);

    
    // Column x coordinates
    const col1X = marginX;
    const colRightX = marginX + 190;
    // No vertical/horizontal lines for the container section as requested
    const firstRowTextY = tableHeaderY + 8;
    let rowEndY = firstRowTextY + 50; // reduced to tighten layout
    // Header bottom line
    // No header underline

    // Row content
    doc.setFontSize(9);
    doc.setFont('arial', 'normal');
    
    // Display all containers with their details vertically with pagination support
    let containerY = firstRowTextY + 6;
    const maxYOnPage = 250; // Maximum Y coordinate before needing a new page
    const containerSpacing = 12; // Height needed for each container row in table format    // Determine which containers to use
    const containersToShow = (blFormData?.containers && blFormData.containers.length > 0) 
      ? blFormData.containers 
      : containers;
    
    // NEW LOGIC: If more than 3 containers, move ALL containers to next page
    const shouldMoveAllContainersToNextPage = containersToShow.length > 3;
    
    if (shouldMoveAllContainersToNextPage) {
      // Add message in container section indicating containers are on next page
      doc.setFont('arial', 'bold');
      doc.setFontSize(10);
      doc.text('Find the containers details list below the page annexure.', marginX + 5, containerY + 70);
      
      // Add new page for all containers
      doc.addPage();
      containerY = 80; // Start lower to accommodate header
      
      // Calculate centered positions for second page
      const page2MarginX = (pageWidth - contentWidth) / 2;
      const page2MarginY = 20;
      
      // Add company header information (centered)
      doc.setFont('arial', 'bold');
      doc.setFontSize(14);
      doc.text('RISTAR LOGISTICS PVT LTD', pageWidth / 2, page2MarginY + 10, { align: 'center' });
      
      doc.setFont('arial', 'bold');
      doc.setFontSize(12);
      doc.text('B/L ATTACHMENT', pageWidth / 2, page2MarginY + 20, { align: 'center' });
      
      // Add BL details from form data (centered layout)
      doc.setFont('arial', 'bold');
      doc.setFontSize(10);
      
      const houseBLValue = blFormData?.houseBL || shipment?.houseBL || '';
      // Use houseBL as the main BL number if available, otherwise use generated BL number
      const blNumber = houseBLValue || blFormData?.blNumber || `RST/ NSACMB /25/00179`;
      const dateOfIssue = blFormData?.dateOfIssue || blDate;
      const vesselName = blFormData?.vesselNo || shipment?.vesselName || 'MV. EVER LYRIC 068E';
      
      doc.text(`BL NO.`, page2MarginX + 5, page2MarginY + 40);
      doc.text(`: ${blNumber}`, page2MarginX + 70, page2MarginY + 40);
      doc.text(`DATE OF ISSUE`, page2MarginX + 130, page2MarginY + 40);
      doc.text(`: ${dateOfIssue}`, page2MarginX + 180, page2MarginY + 40);
      
      doc.text(`VESSEL NAME / VOYAGE NO`, page2MarginX + 5, page2MarginY + 50);
      doc.text(`: ${vesselName}`, page2MarginX + 70, page2MarginY + 50);
      
      // Draw line separator (centered) - no need for conditional positioning since no more House BL
      const separatorY = page2MarginY + 60;
      doc.line(page2MarginX + 5, separatorY, page2MarginX + contentWidth - 5, separatorY);
      
      // Add container details title (centered)
      doc.setFont('arial', 'bold');
      doc.setFontSize(12);
      const titleY = separatorY + 15;
      doc.text('CONTAINER DETAILS', pageWidth / 2, titleY, { align: 'center' });
      
      containerY = titleY + 10; // Adjust for header content
      
    // Page number will be added for all pages later ("Page X of Y")
    }
    
    // Draw container display based on container count
    if (containersToShow.length > 0) {
      if (containersToShow.length <= 3) {
        // Vertical display on the left side for 3 or fewer containers
        const containerStartX = marginX + 15; // Left side position
        const containerStartY = containerY;
        const containerWidth = 120; // Width for vertical container display
        
        doc.setFont('arial', 'bold');
        doc.setFontSize(10);
        
        // Variables to calculate totals
        let totalGrossWt = 0;
        let totalNetWt = 0;
        
        containersToShow.forEach((container: any, index: number) => {
          if (!container.containerNumber) return;
          
          const yPos = containerStartY + (index * 45); // 45px spacing between containers
          
          // Container number
          doc.setFont('arial', 'normal');
          doc.setFontSize(10);
          doc.text(container.containerNumber || 'N/A', containerStartX, yPos);
          
          // Seal number
          doc.text(`SEAL NO: ${container.sealNumber || 'N/A'}`, containerStartX, yPos + 8);
          
          // Weights for each container
          const grossWtNum = parseFloat(container.grossWt) || 0;
          const netWtNum = parseFloat(container.netWt) || 0;
          totalGrossWt += grossWtNum;
          totalNetWt += netWtNum;
          
          const grossWt = container.grossWt ? `${container.grossWt} KGS` : 'N/A';
          const netWt = container.netWt ? `${container.netWt} KGS` : 'N/A';
          
          doc.text(`GROSS WT: ${grossWt}`, containerStartX, yPos + 16);
          doc.text(`NET WT: ${netWt}`, containerStartX, yPos + 24);
          
          // No separator lines between containers
        });
        
        // Update containerY to position after vertical containers
        containerY = containerStartY + (containersToShow.length * 45) + 10;
        
        // No totals display for 3 or fewer containers as per user request
        
      } else {
        // Table format for more than 3 containers (existing logic)
        const tableStartY = containerY;
        // Increase table width further for better readability on the attachment page
        const tableWidth = 247;
        const tableX = (pageWidth - tableWidth) / 2; // Center the table on the page
        const col1Width = 70; // CONTAINER NO
        const col2Width = 62; // PRODUCT GROSS WT  
        const col3Width = 62; // PRODUCT NET WT
        const col4Width = tableWidth - (col1Width + col2Width + col3Width); // SEAL NO (remainder)
        
        // Table header with borders
        doc.setFont('arial', 'bold');
        doc.setFontSize(10);
        
        // Draw header background and borders
        doc.rect(tableX, tableStartY - 2, tableWidth, 12);
        
        // Header text (centered within each column)
        const cell1CenterX = tableX + col1Width / 2;
        const cell2CenterX = tableX + col1Width + col2Width / 2;
        const cell3CenterX = tableX + col1Width + col2Width + col3Width / 2;
        const cell4CenterX = tableX + col1Width + col2Width + col3Width + col4Width / 2;
        doc.text('CONTAINER NO.', cell1CenterX, tableStartY + 6, { align: 'center' });
        doc.text('PRODUCT GROSS WT', cell2CenterX, tableStartY + 6, { align: 'center' });
        doc.text('PRODUCT NET WT', cell3CenterX, tableStartY + 6, { align: 'center' });
        doc.text('SEAL NO.', cell4CenterX, tableStartY + 6, { align: 'center' });
        
        // Draw vertical lines for header
        doc.line(tableX + col1Width, tableStartY - 2, tableX + col1Width, tableStartY + 10);
        doc.line(tableX + col1Width + col2Width, tableStartY - 2, tableX + col1Width + col2Width, tableStartY + 10);
        doc.line(tableX + col1Width + col2Width + col3Width, tableStartY - 2, tableX + col1Width + col2Width + col3Width, tableStartY + 10);
        
        containerY = tableStartY + 12;
        
        // Variables to calculate totals
        let totalGrossWt = 0;
        let totalNetWt = 0;
        
        // Container data rows with borders
        doc.setFont('arial', 'normal');
        doc.setFontSize(10);
        
        containersToShow.forEach((container: any, index: number) => {
          if (!container.containerNumber) return;
          
          const rowY = containerY;
          
          // Draw row borders
          doc.rect(tableX, rowY, tableWidth, 12);
          
          // Draw vertical lines for data rows
          doc.line(tableX + col1Width, rowY, tableX + col1Width, rowY + 12);
          doc.line(tableX + col1Width + col2Width, rowY, tableX + col1Width + col2Width, rowY + 12);
          doc.line(tableX + col1Width + col2Width + col3Width, rowY, tableX + col1Width + col2Width + col3Width, rowY + 12);
          
          // Container data (centered in each column)
          doc.text(container.containerNumber || 'N/A', cell1CenterX, rowY + 8, { align: 'center' });
          
          // Parse and add to totals
          const grossWtNum = parseFloat(container.grossWt) || 0;
          const netWtNum = parseFloat(container.netWt) || 0;
          totalGrossWt += grossWtNum;
          totalNetWt += netWtNum;
          
          const grossWt = container.grossWt ? `${container.grossWt} KGS` : 'N/A';
          doc.text(grossWt, cell2CenterX, rowY + 8, { align: 'center' });
          
          const netWt = container.netWt ? `${container.netWt} KGS` : 'N/A';
          doc.text(netWt, cell3CenterX, rowY + 8, { align: 'center' });
          
          doc.text(container.sealNumber || 'N/A', cell4CenterX, rowY + 8, { align: 'center' });
          
          containerY += 12;
        });
        
        // Add TOTAL row at the bottom
        const totalRowY = containerY;
        
        // Draw total row borders
        doc.rect(tableX, totalRowY, tableWidth, 12);
        
        // Draw vertical lines for total row
        doc.line(tableX + col1Width, totalRowY, tableX + col1Width, totalRowY + 12);
        doc.line(tableX + col1Width + col2Width, totalRowY, tableX + col1Width + col2Width, totalRowY + 12);
        doc.line(tableX + col1Width + col2Width + col3Width, totalRowY, tableX + col1Width + col2Width + col3Width, totalRowY + 12);
        
        // Total row data
        doc.setFont('arial', 'bold');
        doc.text('TOTAL', cell1CenterX, totalRowY + 8, { align: 'center' });
        doc.text(`${totalGrossWt.toFixed(2)} KGS`, cell2CenterX, totalRowY + 8, { align: 'center' });
        doc.text(`${totalNetWt.toFixed(2)} KGS`, cell3CenterX, totalRowY + 8, { align: 'center' });
        // Leave seal no total field empty as requested
        doc.text('', tableX + col1Width + col2Width + col3Width + 2, totalRowY + 8);
        
        containerY += 12; // Update containerY after total row
      }
    }
    
    // Container weights are shown individually with each container, no need for overall weights

    // Reset to first page for remaining content (only if we moved to a new page for containers)
    if (shouldMoveAllContainersToNextPage) {
      // Go back to first page to add remaining content
      doc.setPage(1);
    }

    // doc.text('SEAL NO: 014436', 70, firstRowTextY + 7);
    // doc.text('GROSS WT. 20,030.00 KGS', 70, firstRowTextY + 11);

    // Dynamic container count logic with better positioning and formatting
    const containerCount = Math.max(containers.length, blFormData?.containers?.length || 0);
    const containerText = `${containerCount.toString().padStart(2, '0')}X20 ISO TANK SAID TO CONTAINS`;
    
    // Set consistent font for this section
    doc.setFont('arial', 'normal');
    doc.setFontSize(10);
    doc.text(containerText, marginX + 110, firstRowTextY + 6);
    
    // Use BL Details if provided, with dynamic text fitting
    const descriptionMaxY = firstRowTextY + 45; // Maximum Y position for description content
    const descriptionMaxWidth = 78;
    let currentDescriptionY = firstRowTextY + 12;
    
    if (blDetails.trim()) {
      // Display the BL details field content with constrained height
      const blDetailsLines = doc.splitTextToSize(blDetails, descriptionMaxWidth);
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      
      // Limit the number of lines to prevent overflow
      const maxDescriptionLines = Math.floor((descriptionMaxY - currentDescriptionY) / 4);
      const displayedLines = blDetailsLines.slice(0, maxDescriptionLines);
      
      displayedLines.forEach((line: string) => {
        if (currentDescriptionY < descriptionMaxY) {
          doc.text(line, marginX + 110, currentDescriptionY);
          currentDescriptionY += 4;
        }
      });
    }
    
    // Get freight payable option and related port info
    const freightPayableAt = blFormData?.freightPayableAt || '';
    const freightText = freightPayableAt === 'prepaid' ? '"FREIGHT PREPAID"' : 
                       freightPayableAt === 'postpaid' ? '"FREIGHT POSTPAID"' : '"FREIGHT PREPAID"';
    
    // Get free days and detention rate from shipment data
    const freeDays = shipment?.polFreeDays || shipment?.podFreeDays || '';
    const detentionRate = shipment?.polDetentionRate || shipment?.podDetentionRate || '';
    
    // Additional block under description - improved spacing and alignment
    let addY = firstRowTextY + 50;
    doc.setFont('arial', 'normal');
    doc.setFontSize(9);
    doc.text(freightText, marginX + 110, addY);
    addY += 8;
    
    // Dynamic free days text
    const freeDaysText = freeDays ? `FREE ${freeDays} DAYS AT DESTINATION PORT THERE AFTER AT` : '';
    if (freeDaysText) {
      doc.text(freeDaysText, marginX + 110, addY);
      addY += 5;
    }
    
    // Dynamic detention rate text
    const detentionText = detentionRate ? `USD ${detentionRate} /DAY/TANK` : '';
    if (detentionText) {
      doc.text(detentionText, marginX + 110, addY);
      addY += 8;
    }

    // Charge lines with better formatting - Use dynamic values from form data
    doc.setFont('arial', 'bold');
    doc.setFontSize(8);
    const chargeLines = [
      '"SHIPPING LINE /SHIPPING LINE AGENTS ARE ELIGIBLE UNDER THIS B/L TERMS, TO',
      'COLLECT CHARGES SUCH AS',
      `SECURITY DEPOSIT – ${blFormData?.securityDeposit || 'SAR 3000 per dry container & SAR 7,000 per Reefer/Flat rack/special equipment'}`,
      `LOLO charges: ${blFormData?.loloCharges || 'SAR 100/150 + VAT'}`,
      `ORC: ${blFormData?.Orc || 'SAR 300/450/560 per 20/40/45 for NON-DG and SAR375/562.50/700 per 20\'/40\'/45\' for DG respectively.'}`,
      `Inspection Fees: ${blFormData?.inspectionFees || 'SAR 140 per container'}`,
      `Reefer plug in charges: ${blFormData?.reeferPlugInCharges || 'SAR 134/day per reefer'}`,
      `Special gear charges: ${blFormData?.specialGearCharges || 'SAR 300 per unit for OOG'}`,
      `Riyadh destined Container shifting: ${blFormData?.riyadhDestinedContainerShifting || 'SAR 60 per unit'}`,
      `X-Ray charges for Riyadh shipment: ${blFormData?.xRayChargesForRiyadhShifting || 'SAR 460/560 (20\'/40\')'}`,
      `Line detention: ${blFormData?.lineDetection || 'As per MAWANI regulation article 28/02'}`,
      `Damage repair / cleaning charges: ${blFormData?.damageRepairCleaningCharges || 'as per actual, if any.'}`
    ];
    
    chargeLines.forEach((t) => {
      const normalized = normalizePdfText(t);
      // Ensure character spacing is reset to prevent spacing artifacts
      if ((doc as any).setCharSpace) { 
        (doc as any).setCharSpace(0); 
      }
      // Use splitTextToSize to handle wrapping but render line by line to avoid justification
      const wrappedLines = doc.splitTextToSize(normalized, 78);
      
      // Render each wrapped line individually with no special options
      wrappedLines.forEach((line: string, lineIndex: number) => {
        doc.text(line.trim(), marginX + 110, addY + (lineIndex * 3.5));
      });
      
      addY += wrappedLines.length * 3.5 + 2;
    });

    rowEndY = Math.max(rowEndY, addY);

    // // Shift the right-side Gross/Net weight further right to avoid collision with product text
    // if (grossKgsLong) doc.text(`GROSS WT. ${grossKgsLong}`, 220, firstRowTextY + 6);
    // if (netKgsLong) doc.text(`NET WT. ${netKgsLong}`, 220, firstRowTextY + 12);

    const tableBottomY = rowEndY;

    // Removed extra separator line before bottom section to avoid double lines

    // Bottom grid box (no BL SURRENDERED text)
    const bottomBoxTop = tableBottomY + 4; // Reduced from 8 to 4 to save space
    // Reduced height to free more space for the terms section below
    const bottomBoxHeight = 48; // Reduced from 52 to 48
    doc.setLineWidth(0.5);
    // Draw bottom box without bottom edge so there is only one line between this box and the terms box below
    // left vertical
    doc.line(marginX, bottomBoxTop, marginX, bottomBoxTop + bottomBoxHeight);
    // top horizontal
    doc.line(marginX, bottomBoxTop, marginX + headerWidth, bottomBoxTop);
    // right vertical
    doc.line(marginX + headerWidth, bottomBoxTop, marginX + headerWidth, bottomBoxTop + bottomBoxHeight);

    // Four-column layout with better proportions: Delivery Agent | Freight Amount | Number of original & Place/date
    const colDA_X = marginX;                                    // left start
    const colFA_X = marginX + (75 / 190) * headerWidth;        // Freight Amount start  
    const colNUM_X = marginX + (125 / 190) * headerWidth;      // Number of original / Place/date start
    const colRightEnd = marginX + headerWidth;

    // Draw vertical separators confined to their respective sections
    doc.line(colFA_X, bottomBoxTop, colFA_X, bottomBoxTop + bottomBoxHeight);
    doc.line(colNUM_X, bottomBoxTop, colNUM_X, bottomBoxTop + bottomBoxHeight);

    // Bottom box headers with better spacing
    doc.setFont('arial', 'bold');
    doc.setFontSize(11);
    const rightSectionPaddingLeft = 2;
    const rightSectionPaddingRight = 2;
    const rightColX = colNUM_X + rightSectionPaddingLeft;
    const rightSectionRight = colRightEnd - rightSectionPaddingRight; // keep a small inset from border
    doc.text('Delivery Agent', marginX + 5, bottomBoxTop + 8);
    doc.text('Freight Amount', colFA_X + 5, bottomBoxTop + 8);
    
    // Add horizontal separator in freight section for "Freight payable at"
    doc.line(colFA_X, bottomBoxTop + 18, colNUM_X, bottomBoxTop + 18);
    doc.text('Freight payable at', colFA_X + 5, bottomBoxTop + 26);
    
    // Right section headers - improved alignment and slight extra separation
    doc.text('Number of original BL/MTD(s)', rightColX, bottomBoxTop + 8);
    doc.text('Date of issue', rightSectionRight, bottomBoxTop + 8, { align: 'right' });

    // Bottom box values with proper spacing and alignment
    doc.setFont('arial', 'bold');
    doc.setFontSize(10);
    
    // Delivery Agent section - Ultra compact to save space for terms
    let deliveryAgentY = bottomBoxTop + 12; // Reduced from 14
    const deliveryAgentMaxY = bottomBoxTop + bottomBoxHeight - 2; // Reduced margin
    const deliveryAgentMaxWidth = colFA_X - marginX - 4; // Reduced padding
    
    // Use very compact spacing for all fields
    const compactLineSpacing = 4; // Reduced from 4-5
    
    // Delivery Agent Name - Bold (single line only)
    if (deliveryAgent?.name && deliveryAgentY < deliveryAgentMaxY - 10) {
      doc.setFont('arial', 'bold');
      doc.setFontSize(10); // Reduced font size
      const nameLines = doc.splitTextToSize(deliveryAgent.name, deliveryAgentMaxWidth);
      doc.text(nameLines[0], marginX + 5, deliveryAgentY + 2); // Only first line
      deliveryAgentY += compactLineSpacing;
    }
    
    // Delivery Agent Address - Normal (single line only)
    if (deliveryAgent?.address && deliveryAgentY < deliveryAgentMaxY - 6) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const agentAddressLines = doc.splitTextToSize(deliveryAgent.address, deliveryAgentMaxWidth);
      doc.text(agentAddressLines[0], marginX + 5, deliveryAgentY + 2); // Only first line
      deliveryAgentY += compactLineSpacing;
    }
    
    // Delivery Agent Contact - Normal (single line only)
    if (deliveryAgent?.contactNo && deliveryAgentY < deliveryAgentMaxY - 3) {
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const telLines = doc.splitTextToSize(`TEL: ${deliveryAgent.contactNo}`, deliveryAgentMaxWidth);
      doc.text(telLines[0], marginX + 5, deliveryAgentY + 2);
      deliveryAgentY += compactLineSpacing; 
    }
    
    // Delivery Agent Email - Normal (single line only)
    if (deliveryAgent?.email && deliveryAgentY < deliveryAgentMaxY) {
      doc.setFont('arial', 'bold');
      doc.setFontSize(10);
      const emailLines = doc.splitTextToSize(`EMAIL: ${deliveryAgent.email}`, deliveryAgentMaxWidth);
      doc.text(emailLines[0], marginX + 5, deliveryAgentY + 2);
    }
    
    // Freight section with better alignment
    doc.text(freightAmount || '2000', colFA_X + 5, bottomBoxTop + 16);
    
    // Dynamic port selection based on freight payable option
    let freightPayablePort = 'Nhava Sheva'; // default
    if (freightPayableAt === 'prepaid') {
      freightPayablePort = polName || 'Nhava Sheva'; // Port of Loading
    } else if (freightPayableAt === 'postpaid') {
      freightPayablePort = podName || 'Nhava Sheva'; // Port of Discharge
    }
    
    doc.text(freightPayablePort, colFA_X + 5, bottomBoxTop + 34);
    
    // Right section - Number of originals and place/date
    const copyNumberTexts = ['0(ZERO)', '1(ONE)', '2(TWO)'];
    const copyNumberText = copyNumberTexts[copyNumber] || '0(ZERO)';
    doc.text(`${copyNumberText} ${freightPayablePort}`, rightColX, bottomBoxTop + 16);
    // Horizontal rule just below the copy number/place text within the rightmost section
    doc.line(colNUM_X, bottomBoxTop + 18, colRightEnd, bottomBoxTop + 18);
    
    // Place and date of issue - right aligned with extra padding from border
    doc.text(blDate, rightSectionRight, bottomBoxTop + 16, { align: 'right' });
    doc.text('For RISTAR LOGISTICS PVT LTD', rightColX, bottomBoxTop + 28);
    // Add "As Agent for the Carrier" below the company line inside the rightmost section
    doc.text('As Agent for the Carrier', rightColX, bottomBoxTop + 80);

    // Terms block moved below the bottom grid (new section)
    // Increase terms box height for better fit and alignment
    // Position terms box closer to the bottom grid to reclaim vertical space
    // Align the terms box directly under the bottom grid so vertical lines touch without gaps
    const termsBoxTop = bottomBoxTop + bottomBoxHeight;
    const termsBoxHeight = 120; // Further extend height so text stays comfortably inside the section
    // Draw the top separator only under Delivery Agent + Freight sections (exclude rightmost section)
    doc.line(marginX, termsBoxTop, colNUM_X, termsBoxTop);
    // Extend the middle vertical separator only within the terms box bounds (and not past outer border)
    const outerBottomY = marginY + pageHeight - 30;
    const termsSeparatorBottomY = Math.min(termsBoxTop + termsBoxHeight, outerBottomY);
    doc.line(colNUM_X, termsBoxTop, colNUM_X, termsSeparatorBottomY);
    // Remove left and right vertical borders of terms box as requested
  // Omit bottom edge of terms box so only the outer page border shows at the end
  // Reduce top padding so the first line starts higher (closer to the separator line)
  // Add some spacing from the top separator before the terms text begins
  const miniTermsY = termsBoxTop + 4; // Reduced padding from 6 to 4
  doc.setFontSize(7); // Further reduced from 7 to 6 for better fit inside the section
  const miniTerms = [
      'By accepting this Bill of lading shipper accepts and abides by all terms, conditions clauses printed and stamped on the face or reverse side of this bill of lading.',
      'By accepting this Bill of lading, the shipper accepts his responsibility towards the carrier for payment of freight (in case of freight collect shipments), Accrued',
      'Government, reshipment or disposal costs (as the case may be) if the consignee fails to take delivery of the cargo within 90 days from the date of cargo reaches destination.',
      'For freight prepaid Bill of Ladings, delivery of Cargo is subject to realisation of freight cheque. Demurrage/Detention charges at port of destination payable by consignee as per',
      "line's tariff.",
      'The carrier reserves the right to repack the goods if the same are not in seaworthy packing.The packing condition will be certified by the local bonded',
      'warehouse of competent surveyor , and the shipper by virtue of accepting this bill of lading accepts the liability towards the cost for the same.',
      'For shipments where inland trucking is involved it is mandatory on consignee to custom clear the shipment at port of discharge.',
      'In case of any discrepancy found in declared weight & volume the carrier reserve the right to hold the shipment & recover all charges as per the revised weight&',
      'volume whichever is high from shipper or consignee.'
    ];
    let mtY = miniTermsY; 
  // Constrain terms text to the left of the new vertical separator
  const miniTermsMaxWidth = Math.max(40, (colNUM_X - (marginX + 9))); 
  
  // Calculate available height for text to prevent overflow
  const availableHeight = termsBoxHeight - 8; // Leave some margin at bottom
  // Ensure text never crosses the outer page bottom border
  const textBottomLimit = (marginY + pageHeight - 28) - 3; // 3mm safety
  const maxBottomY = Math.min(termsBoxTop + availableHeight, textBottomLimit);
  
  miniTerms.forEach((t) => {
      // Check if we have space for more text
      if (mtY >= maxBottomY) return; // Stop adding text if we've reached the limit
      
      const wrapped = doc.splitTextToSize(t, miniTermsMaxWidth);
      
      // Check if this text block will fit
      const textBlockHeight = wrapped.length * 2.5 + 0.5;
      if (mtY + textBlockHeight <= maxBottomY) {
        doc.text(wrapped, marginX + 7, mtY); // Slightly indented for alignment
        // Reduced line spacing from 3.0 + 0.8 to 2.5 + 0.5 for tighter fit
        mtY += textBlockHeight;
      }
    });    // Remove the interfering lines that were cutting through the text
    // No additional line reinforcement needed in terms section

    // Removed rightmost stamp cell per request

    // Save the PDF
    let fileName = "";
    const copySuffix = copyNumber === 0 ? '' : copyNumber === 1 ? '_2nd_Copy' : '_3rd_Copy';
    switch (blType) {
      case 'original':
        fileName = `RST_NSAJEA_25_00001_Original_BL${copySuffix}.pdf`;
        break;
      case 'draft':
        fileName = `RST_NSAJEA_25_00001_Draft_BL${copySuffix}.pdf`;
        break;
      case 'seaway':
        fileName = `RST_NSAJEA_25_00001_Seaway_BL${copySuffix}.pdf`;
        break;
    }

    // Add page numbers to all pages as "Page X of Y"
    const totalPages = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : 1;
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      const pageNumberText = `Page ${p} of ${totalPages}`;
      // Keep position consistent with prior single "Page 2" placement
      doc.text(pageNumberText, pageWidth - 40, pageHeight - 20);
    }

    doc.save(fileName);
  } catch (err) {
    console.error("Error generating BL PDF", err);
  }
}

