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

    // Format dates
    const blDate = dayjs().format("DD.MM.YYYY");
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
    const marginY = 20; // Top margin

    // Main border (centered)
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(marginX, marginY, contentWidth, pageHeight - 40);
    
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

    // Left column content with wrapping
    let y = headerTop + 8;
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('SHIPPER', leftX, y);
    doc.setFont('arial', 'normal');
    doc.setFontSize(10);
    y += 6;
    const formatAB = (ab: any) => ab ? `${ab.companyName}, ${ab.address}` : '';
    let lines = doc.splitTextToSize(formatAB(shipper), leftMaxWidth);
    doc.text(lines, leftX, y);
    y += lines.length * 3.2;
    if (shipper?.phone) doc.text(`TEL: ${shipper.phone}`, leftX, y);
    // underline after SHIPPER block
    const shipperUnderlineY = y + 5;
    doc.setLineWidth(0.4);
    doc.line(headerLeft + 2, shipperUnderlineY, headerSplitX - 2, shipperUnderlineY);

    // Consignee
    y += 10; // add breathing space so heading doesn't touch previous line
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Consignee (or order)', leftX, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('arial', 'normal');
    lines = doc.splitTextToSize(formatAB(consignee), leftMaxWidth);
    doc.text(lines, leftX, y);
    y += lines.length * 3.2;
    // underline after Consignee block
    const consigneeUnderlineY = y + 5;
    doc.line(headerLeft + 2, consigneeUnderlineY, headerSplitX - 2, consigneeUnderlineY);

    // Notify Party
    y += 10; // increase spacing above Notify Party heading
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Notify Party', leftX, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('arial', 'normal');
    lines = doc.splitTextToSize(formatAB(notifyParty), leftMaxWidth);
    doc.text(lines, leftX, y);
    const leftBottomY = y + lines.length * 3.2;

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
    doc.setFont('arial', 'normal');
    doc.setFontSize(12); // Increased font size from 10 to 12
    let rLines = doc.splitTextToSize('Office No. C- 0010, Akshar Business Park, Plot No 3, Sector 25, Vashi Navi Mumbai - 400703', rightMaxWidth);
    // Center the address text
    doc.text(rLines, companyNameCenterX, ry + 6, { align: 'center' });
    ry += 6 + rLines.length * 5 + 3;
    doc.setFontSize(8);
    const termsBlock = [
      'Ristar Logistics approved good condition herein at the place of receipt for transport and delivery as mentioned above, unless otherwise stated. The MFD undertakes to perform or to procure the performance.',
      'The transport to the place for which the goods are taken for carriage, to the place designated for delivery and assumes responsibility for any loss or damage except as provided below, all services rendered in exchange for the goods. In witness whereof the original MTD of this tone and date in witness whereof having accomplished the other(s) to be void.'
    ];
    const termsWrapped = doc.splitTextToSize(termsBlock.join(' '), rightMaxWidth);
    doc.text(termsWrapped, rightX, ry);
    const rightBottomY = ry + termsWrapped.length * 3.2;
  
    // Determine header height dynamically
    const contentBottomY = Math.max(leftBottomY, rightBottomY);
    const portsTop = contentBottomY + 4; // start ports grid after content
    const rowH = 12; // increased row height to allow more label->value spacing
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
    doc.text(polName || '', pLeftX, portsTop + 10);
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Port Of Discharge', pMidX, portsTop + 4);
    doc.setFontSize(10);
    doc.setFont('arial', 'normal');
    doc.text(podName || '', pMidX, portsTop + 10);
    // underline row 1 (only left panel)
    doc.line(headerLeft, portsTop + rowH, headerSplitX, portsTop + rowH);

    // Row 2
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Port Of Loading', pLeftX, portsTop + rowH + 4);
    doc.setFontSize(10);
    doc.setFont('arial', 'normal');
    doc.text(polName || '', pLeftX, portsTop + rowH + 10);
    doc.line(headerLeft, portsTop + rowH * 2, headerSplitX, portsTop + rowH * 2);

    // Row 3
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    doc.text('Place Of Delivery', pLeftX, portsTop + rowH * 2 + 4);
    doc.setFont('arial', 'normal');
    doc.text(podName || '', pLeftX, portsTop + rowH * 2 + 10);
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
    const tableTop = yPos + 10;
    doc.setLineWidth(1);

    // Table container
    // Place the container headers closer to the header box
    const containerTopY = headerTop + totalHeaderHeight + 2;
    const tableHeaderY = containerTopY + 4;
    doc.setLineWidth(0.5);

    // Headers
    doc.setFontSize(10);
    doc.setFont('arial', 'bold');
    doc.text('Container No.(s)', marginX + 5, tableHeaderY);
    doc.text('Marks and numbers', marginX + 60, tableHeaderY);
    doc.text('Number of packages, kinds of packages;', marginX + 110, tableHeaderY);
    doc.text('general description of goods', marginX + 110, tableHeaderY + 4);
    // Removed the Gross/Net Weight header while keeping their values below
    // Add a header underline right below the header row
    doc.setLineWidth(0.6);
    const headerUnderlineY = tableHeaderY + 6; // just above first row content
    doc.line(marginX, headerUnderlineY, marginX + headerWidth, headerUnderlineY);

    
    // Column x coordinates
    const col1X = marginX;
    const colRightX = marginX + 190;
    // No vertical/horizontal lines for the container section as requested
    const firstRowTextY = tableHeaderY + 6;
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
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      doc.text('Find the containers details list below the page annexure.', marginX + 15, containerY);
      
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
      
      doc.setFont('arial', 'normal');
      doc.setFontSize(12);
      doc.text('B/L ATTACHMENT', pageWidth / 2, page2MarginY + 20, { align: 'center' });
      
      // Add BL details from form data (centered layout)
      doc.setFont('arial', 'normal');
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
      
      // Add page number at bottom right
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      doc.text('Page 2', pageWidth - 30, pageHeight - 20);
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
        const tableWidth = 165;
        const tableX = (pageWidth - tableWidth) / 2; // Center the table on the page
        const col1Width = 40; // CONTAINER NO
        const col2Width = 40; // GROSS WT  
        const col3Width = 40; // NET WT
        const col4Width = 45; // SEAL NO
        
        // Table header with borders
        doc.setFont('arial', 'bold');
        doc.setFontSize(10);
        
        // Draw header background and borders
        doc.rect(tableX, tableStartY - 2, tableWidth, 12);
        
        // Header text
        doc.text('CONTAINER NO.', tableX + 2, tableStartY + 6);
        doc.text('GROSS WT.', tableX + col1Width + 2, tableStartY + 6);
        doc.text('NET WT.', tableX + col1Width + col2Width + 2, tableStartY + 6);
        doc.text('SEAL NO.', tableX + col1Width + col2Width + col3Width + 2, tableStartY + 6);
        
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
          
          // Container data
          doc.text(container.containerNumber || 'N/A', tableX + 2, rowY + 8);
          
          // Parse and add to totals
          const grossWtNum = parseFloat(container.grossWt) || 0;
          const netWtNum = parseFloat(container.netWt) || 0;
          totalGrossWt += grossWtNum;
          totalNetWt += netWtNum;
          
          const grossWt = container.grossWt ? `${container.grossWt} KGS` : 'N/A';
          doc.text(grossWt, tableX + col1Width + 2, rowY + 8);
          
          const netWt = container.netWt ? `${container.netWt} KGS` : 'N/A';
          doc.text(netWt, tableX + col1Width + col2Width + 2, rowY + 8);
          
          doc.text(container.sealNumber || 'N/A', tableX + col1Width + col2Width + col3Width + 2, rowY + 8);
          
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
        doc.text('TOTAL', tableX + 2, totalRowY + 8);
        doc.text(`${totalGrossWt.toFixed(2)} KGS`, tableX + col1Width + 2, totalRowY + 8);
        doc.text(`${totalNetWt.toFixed(2)} KGS`, tableX + col1Width + col2Width + 2, totalRowY + 8);
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
    
    // Use BL Details if provided, with improved text wrapping and consistent formatting
    if (blDetails.trim()) {
      // Display the BL details field content with better formatting
      const blDetailsLines = doc.splitTextToSize(blDetails, 78); // Slightly wider for better fit
      let detailsY = firstRowTextY + 12;
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      blDetailsLines.forEach((line: string) => {
        doc.text(line, marginX + 110, detailsY);
        detailsY += 4;
      });
    }
    
    // Additional block under description - improved spacing and alignment
    let addY = firstRowTextY + 50;
    doc.setFont('arial', 'bold');
    doc.setFontSize(9);
    doc.text('"FREIGHT PREPAID"', marginX + 110, addY);
    addY += 8;
    doc.text('FREE 14 DAYS AT DESTINATION PORT THERE AFTER AT', marginX + 110, addY);
    addY += 5;
    doc.text('USD 45 /DAY/TANK', marginX + 110, addY);
    addY += 8;

    doc.text('"SHIPPING LINE /SHIPPING LINE AGENTS ARE ELIGIBLE UNDER THIS B/L TERMS, TO', marginX + 110, addY);
    addY += 5;
    doc.text('COLLECT CHARGES SUCH AS', marginX + 110, addY);
    addY += 6;

    // Charge lines with better formatting
    doc.setFont('arial', 'normal');
    doc.setFontSize(8);
    const chargeLines = [
      'SECURITY DEPOSIT – SAR 3000 per dry container & SAR 7,000 per Reefer/Flat rack/special equipment',
      'LOLO charges: SAR 100/150 + VAT',
      'ORC: SAR 300/450/560 per 20/40/45 for NON-DG and SAR375/562.50/700 per 20\'/40\'/45\' for DG respectively.',
      'Inspection Fees: SAR 140 per container',
      'Reefer plug in charges: SAR 134/day per reefer',
      'Special gear charges: SAR 300 per unit for OOG',
      'Riyadh destined Container shifting: SAR 60 per unit',
      'X-Ray charges for Riyadh shipment: SAR 460/560 (20\'/40\')',
      'Line detention: As per MAWANI regulation article 28/02',
      'Damage repair / cleaning charges: as per actual, if any.'
    ];
    chargeLines.forEach((t) => {
      const wrapped = doc.splitTextToSize(t, 78); // Better text wrapping width
      doc.text(wrapped, marginX + 110, addY);
      addY += wrapped.length * 3.5 + 2; // Better line spacing
    });

    rowEndY = Math.max(rowEndY, addY);

    // // Shift the right-side Gross/Net weight further right to avoid collision with product text
    // if (grossKgsLong) doc.text(`GROSS WT. ${grossKgsLong}`, 220, firstRowTextY + 6);
    // if (netKgsLong) doc.text(`NET WT. ${netKgsLong}`, 220, firstRowTextY + 12);

    const tableBottomY = rowEndY;

    // Removed extra separator line before bottom section to avoid double lines

    // Bottom grid box (no BL SURRENDERED text)
    const bottomBoxTop = tableBottomY + 8;
    const bottomBoxHeight = 56;
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

    // Draw vertical separators with full height
    doc.line(colFA_X, bottomBoxTop, colFA_X, bottomBoxTop + bottomBoxHeight);
    doc.line(colNUM_X, bottomBoxTop, colNUM_X, bottomBoxTop + bottomBoxHeight);

    // Bottom box headers with better spacing
    doc.setFont('arial', 'bold');
    doc.setFontSize(9);
    const rightColX = colNUM_X + 3;
    doc.text('Delivery Agent', marginX + 3, bottomBoxTop + 8);
    doc.text('Freight Amount', colFA_X + 3, bottomBoxTop + 8);
    
    // Add horizontal separator in freight section for "Freight payable at"
    doc.line(colFA_X, bottomBoxTop + 18, colNUM_X, bottomBoxTop + 18);
    doc.text('Freight payable at', colFA_X + 3, bottomBoxTop + 26);
    
    // Right section headers - improved alignment
    doc.text('Number of original BL/MTD(s)', rightColX, bottomBoxTop + 8);
    doc.text('Place and date of issue', colRightEnd - 3, bottomBoxTop + 8, { align: 'right' });

    // Bottom box values with proper spacing and alignment
    doc.setFont('arial', 'normal');
    doc.setFontSize(9);
    
    // Delivery Agent section
    if (deliveryAgent?.name) {
      doc.text(deliveryAgent.name, marginX + 3, bottomBoxTop + 16);
    }
    if (deliveryAgent?.address) {
      const agentAddressLines = doc.splitTextToSize(deliveryAgent.address, 65);
      let agentY = bottomBoxTop + 22;
      agentAddressLines.forEach((line: string, index: number) => {
        if (index < 3) { // Limit to 3 lines to prevent overflow
          doc.text(line, marginX + 3, agentY);
          agentY += 6;
        }
      });
    }
    if (deliveryAgent?.contactNo) {
      doc.text(`TEL: ${deliveryAgent.contactNo}`, marginX + 3, bottomBoxTop + 44);
    }
    if (deliveryAgent?.email) {
      doc.text(`EMAIL: ${deliveryAgent.email}`, marginX + 3, bottomBoxTop + 50);
    }
    
    // Freight section with better alignment
    doc.text(freightAmount || '2000', colFA_X + 3, bottomBoxTop + 16);
    doc.text(polName || 'Nhava Sheva', colFA_X + 3, bottomBoxTop + 34);
    
    // Right section - Number of originals and place/date
    const copyNumberTexts = ['0(ZERO)', '1(ONE)', '2(TWO)'];
    const copyNumberText = copyNumberTexts[copyNumber] || '0(ZERO)';
    doc.text(`${copyNumberText} ${polName || 'Nhava Sheva'}`, rightColX, bottomBoxTop + 16);
    
    // Place and date of issue - right aligned
    doc.text(blDate, colRightEnd - 3, bottomBoxTop + 16, { align: 'right' });
    doc.text('For RISTAR LOGISTICS PVT LTD', rightColX, bottomBoxTop + 28);

    // Terms block moved below the bottom grid (new section)
    const termsBoxTop = bottomBoxTop + bottomBoxHeight + 8;
    const termsBoxHeight = 60;
    // Draw a single separator line below the bottom grid and avoid double line at page end
    doc.line(marginX, termsBoxTop, marginX + headerWidth, termsBoxTop); // top separator under Delivery Agent / Freight / For RISTAR
    // Extend bottom grid vertical lines down to this separator so they are complete
    doc.line(colFA_X, bottomBoxTop, colFA_X, termsBoxTop);
    doc.line(colNUM_X, bottomBoxTop, colNUM_X, termsBoxTop);
    // Left and right borders of terms box
    doc.line(marginX, termsBoxTop, marginX, termsBoxTop + termsBoxHeight);
    doc.line(marginX + headerWidth, termsBoxTop, marginX + headerWidth, termsBoxTop + termsBoxHeight);
    // Omit bottom edge of terms box so only the outer page border shows at the end
    const miniTermsY = termsBoxTop + 6;
    doc.setFontSize(6);
    const miniTerms = [
      'By accepting this Bill of lading shipper accepts and abides by all terms, conditions clauses printed and stamped on the face or reverse side of this bill of lading.',
      'By accepting this Bill of lading, the shipper accepts his responsibility towards the carrier for payment of freight (in case of freight collect shipments), Accrued',
      'Government, reshipment or disposal costs (as the case may be) if the consignee fails to take delivery of the cargo within 90 days from the date of cargo reaches destination.',
      'For freight prepaid Bill of Ladings, delivery of Cargo is subject to realisation of freight cheque. Demurrage/Detention charges at port of destination payable by consignee as per',
      'line’s tariff.',
      'The carrier reserves the right to repack the goods if the same are not in seaworthy packing.The packing condition will be certified by the local bonded',
      'warehouse of competent surveyor , and the shipper by virtue of accepting this bill of lading accepts the liability towards the cost for the same.',
      'For shipments where inland trucking is involved it is mandatory on consignee to custom clear the shipment at port of discharge.',
      'In case of any discrepancy found in declared weight & volume the carrier reserve the right to hold the shipment & recover all charges as per the revised weight&',
      'volume whichever is high from shipper or consignee.'
    ];
    let mtY = miniTermsY;
    const miniTermsMaxWidth = headerWidth - 20;
    miniTerms.forEach((t) => {
      const wrapped = doc.splitTextToSize(t, miniTermsMaxWidth);
      doc.text(wrapped, marginX + 5, mtY);
      mtY += wrapped.length * 3 + 2;
    });

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

    doc.save(fileName);
  } catch (err) {
    console.error("Error generating BL PDF", err);
  }
}

