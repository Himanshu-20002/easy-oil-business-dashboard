import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Excel Export Service
export function exportToExcel(applications: Record<string, any>[]) {
  if (!applications || applications.length === 0) {
    alert('No data available to export');
    return;
  }

  // Format rows for Excel
  const formattedRows = applications.map((app) => ({
    'Application ID': app.applicationId,
    'Company Name': app.companyRef?.companyName || 'N/A',
    'Constitution': app.companyRef?.firmType || 'N/A',
    'GSTIN': app.companyRef?.gst || 'N/A',
    'PAN': app.companyRef?.pan || 'N/A',
    'State': app.companyRef?.state || 'N/A',
    'District': app.companyRef?.district || 'N/A',
    'Contact Person': app.companyRef?.contactPerson || 'N/A',
    'Contact Email': app.companyRef?.email || 'N/A',
    'Contact Phone': app.companyRef?.mobile || 'N/A',
    'Fuel Category': app.productType,
    'Quantity Required (L)': app.quantity,
    'Delivery Location': app.location || 'N/A',
    'Storage Ready': app.storageAvailability ? 'Yes' : 'No',
    'Assigned Sales Officer': app.assignedOfficer?.name || 'Unassigned',
    'Submission Status': app.status.toUpperCase()
  }));

  // Create sheet
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'EasyOil B2B Onboarding');

  // Trigger download
  XLSX.writeFile(workbook, `EasyOil_B2B_Onboarding_Report_${Date.now()}.xlsx`);
}

// PDF Export Service
export function exportToPDF(applications: Record<string, any>[]) {
  if (!applications || applications.length === 0) {
    alert('No data available to export');
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  }) as any;

  // Add Corporate Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 84, 166); // IOCL Blue
  doc.text('EasyOil Corporation Limited', 14, 15);
  
  doc.setFontSize(11);
  doc.setTextColor(255, 102, 0); // IOCL Orange
  doc.text('Industrial & Commercial Division - B2B Customer Onboarding Audit Log', 14, 21);

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 250, 15);

  // Table Columns
  const tableColumn = [
    'IOCL ID', 
    'Corporate Partner', 
    'GSTIN', 
    'Product', 
    'Volume (L)', 
    'Assigned Officer', 
    'Status'
  ];

  // Table Rows
  const tableRows = applications.map((app) => [
    app.applicationId,
    app.companyRef?.companyName || 'N/A',
    app.companyRef?.gst || 'N/A',
    app.productType,
    Number(app.quantity).toLocaleString(),
    app.assignedOfficer?.name || 'Unassigned',
    app.status.toUpperCase()
  ]);

  // Generate Styled Autotable
  doc.autoTable({
    startY: 28,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 84, 166], // IOCL Blue
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 65 },
      2: { cellWidth: 40 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 45 },
      6: { cellWidth: 35 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    styles: {
      fontSize: 8,
      overflow: 'linebreak',
      cellPadding: 3
    }
  });

  // Download PDF
  doc.save(`IOCL_B2B_Executive_Audit_${Date.now()}.pdf`);
}
