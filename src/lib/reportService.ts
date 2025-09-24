import { jsPDF } from 'jspdf';
// @ts-expect-error - jspdf-autotable doesn't have type definitions
import 'jspdf-autotable';
import { EnergyFinding } from './energy';

interface ReportData {
  scanId: string;
  findings: EnergyFinding[];
  surveyData: any;
  totalSavings: number;
  totalCost: number;
  paybackPeriod: number;
}

export const generatePdfReport = (data: ReportData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const lineHeight = 7; // Used in text positioning calculations
  let yPos = 20;

  // Add logo and title
  doc.setFontSize(22);
  doc.setTextColor(30, 100, 200);
  doc.text('Energy Efficiency Report', margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPos);
  doc.text(`Scan ID: ${data.scanId}`, pageWidth - margin - 40, yPos, { align: 'right' });
  
  yPos += 15;
  
  // Add summary section
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text('Summary', margin, yPos);
  yPos += 10;
  
  // Summary table with type assertion for jspdf-autotable
  const autoTable = (doc as { autoTable: any }).autoTable;
  autoTable({
    startY: yPos,
    head: [['Metric', 'Value']],
    body: [
      ['Total Potential Annual Savings', `$${data.totalSavings.toFixed(2)}`],
      ['Total Estimated Investment', `$${data.totalCost.toFixed(2)}`],
      ['Estimated Payback Period', `${data.paybackPeriod.toFixed(1)} years`],
      ['Total Findings', data.findings.length.toString()],
      ['Confirmed Actions', data.findings.filter(f => f.confirmed).length.toString()]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 100, 200],
      textColor: 255,
      fontStyle: 'bold'
    },
    margin: { top: yPos, right: margin, bottom: 20, left: margin },
    tableWidth: 'auto',
    styles: { 
      fontSize: 10,
      cellPadding: 5,
      overflow: 'linebreak',
      valign: 'middle',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: '60%', halign: 'left' },
      1: { cellWidth: '40%' }
    }
  });
  
  // @ts-expect-error - lastAutoTable is added by jspdf-autotable
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Add findings section
  doc.setFontSize(14);
  doc.text('Recommended Actions', margin, yPos);
  yPos += 10;
  
  // Findings table with type assertion
  const findingsData = data.findings.map(finding => ({
    area: (finding as any).area || 'General',
    issue: (finding as any).issue || 'Efficiency issue',
    recommendation: finding.recommendation || 'Consider energy efficiency improvements',
    severity: finding.severity || 'medium',
    savings: `$${finding.annualSavings?.toFixed(2) || '0.00'}`,
    cost: `$${finding.estimatedCost?.toFixed(2) || '0.00'}`,
    notes: (finding as any).userNotes || 'N/A'
  }));
  
  autoTable({
    startY: yPos,
    head: [['Area', 'Issue', 'Recommendation', 'Severity', 'Annual Savings', 'Est. Cost']],
    body: findingsData.map(f => [
      f.area,
      f.issue,
      f.recommendation,
      f.severity,
      f.savings,
      f.cost
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [30, 100, 200],
      textColor: 255,
      fontStyle: 'bold'
    },
    margin: { top: yPos, right: margin, bottom: 20, left: margin },
    styles: { 
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
      valign: 'middle',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: '15%' },
      1: { cellWidth: '20%' },
      2: { cellWidth: '25%' },
      3: { cellWidth: '10%' },
      4: { cellWidth: '15%' },
      5: { cellWidth: '15%' }
    },
    didParseCell: function(data: any) {
      // Color code severity
      if (data.column.dataKey === 3) {
        if (data.cell.text[0] === 'High') {
          data.cell.styles.textColor = [200, 0, 0];
        } else if (data.cell.text[0] === 'Medium') {
          data.cell.styles.textColor = [200, 100, 0];
        } else {
          data.cell.styles.textColor = [0, 100, 0];
        }
      }
    }
  });
  
  // @ts-expect-error - lastAutoTable is added by jspdf-autotable
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Add notes section if any findings have notes
  const findingsWithNotes = data.findings.filter(f => f.userNotes);
  if (findingsWithNotes.length > 0) {
    doc.setFontSize(14);
    doc.text('Your Notes', margin, yPos);
    yPos += 10;
    
    findingsWithNotes.forEach((finding) => {
      if (yPos > 250) { // Add new page if needed
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const area = finding.area || 'General';
      const issue = finding.issue || 'Energy Efficiency';
      doc.text(`${area}: ${issue}`, margin, yPos);
      
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(finding.userNotes || '', pageWidth - (2 * margin));
      doc.text(splitNotes, margin, yPos + 5);
      
      yPos += 5 + (splitNotes.length * 5) + 5;
    });
  }
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
    
    // Add watermark
    doc.setFontSize(50);
    doc.setTextColor(230, 230, 230);
    doc.text(
      'ENERGY SAVER',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() / 2,
      { align: 'center', angle: 45 }
    );
  }
  
  // Save the PDF
  doc.save(`energy-efficiency-report-${data.scanId}.pdf`);
};
