// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { ArrowLeft, Download } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { getScanData } from '@/lib/storage';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';

// export function Survey() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const scanId = searchParams.get('scanId');
  
//   const [survey, setSurvey] = useState<Record<string, string>>({});
//   const [isLoading, setIsLoading] = useState(true);

//   // Generate PDF with survey data
//   const generatePdf = useCallback((surveyData: Record<string, string>): void => {
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const margin = 16;

//     // Title
//     doc.setFontSize(20);
//     doc.setTextColor('#1e64c8');
//     doc.text('Home Energy Survey Report', pageWidth / 2, 24, {
//       align: 'center',
//     });

//     // Generated on date
//     doc.setFontSize(10);
//     doc.setTextColor('#666');
//     doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 34);

//     // Survey data table
//     const surveyFields = [
//       { key: 'tenure', label: 'Property Tenure' },
//       { key: 'occupants', label: 'Number of Occupants' },
//       { key: 'heatingType', label: 'Heating Type' },
//       { key: 'coolingType', label: 'Cooling Type' },
//       { key: 'monthlyBill', label: 'Monthly Energy Bill' },
//       { key: 'windowAge', label: 'Window Age' },
//       { key: 'draftFeelings', label: 'Draft Feelings' },
//     ];

//     // Convert survey data to table format
//     const tableData = surveyFields.map(({ key, label }) => [
//       label,
//       surveyData[key] || 'Not specified'
//     ]);

//     // Add survey data table
//     autoTable(doc, {
//       startY: 42,
//       head: [['Category', 'Your Response']],
//       body: tableData,
//       theme: 'grid',
//       styles: { fontSize: 11 },
//       headStyles: { fillColor: [30, 100, 200] },
//       margin: { left: margin, right: margin },
//     });

//     // Add energy saving tips section
//     const energyTips = [
//       'Seal gaps around doors/windows with weather-stripping.',
//       'Upgrade to LED bulbs (use 75% less energy).',
//       'Service HVAC filters every 3 months.',
//       'Install a programmable / smart thermostat.',
//       'Add attic insulation to at least R-38.',
//       'Use ENERGY STAR-rated appliances when replacing old units.',
//       'Fix leaky faucets (1 drip/sec ≈ 3,000 L/year).',
//       'Lower water-heater set-point to 49°C (120°F).',
//     ];

//     // Add tips section if there's space, otherwise add new page
//     const lastTable = doc.getLastAutoTable();
//     let yPos = lastTable ? lastTable.finalY + 10 : 42;
//     if (yPos > 250) {
//       doc.addPage();
//       yPos = 20;
//     }

//     doc.setFontSize(16);
//     doc.setTextColor('#1e64c8');
//     doc.text('Energy Saving Tips', margin, yPos);
//     yPos += 10;

//     // Add tips as a numbered list
//     autoTable(doc, {
//       startY: yPos,
//       head: [['#', 'Energy Saving Tip']],
//       body: energyTips.map((tip, idx) => [idx + 1, tip]),
//       theme: 'grid',
//       styles: { fontSize: 10 },
//       headStyles: { fillColor: [30, 100, 200] },
//       margin: { left: margin, right: margin },
//     });

//     // Add footer with page numbers
//     const pageCount = doc.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(8);
//       doc.setTextColor('#666');
//       doc.text(
//         `Page ${i} of ${pageCount}`,
//         pageWidth - margin,
//         doc.internal.pageSize.getHeight() - 8,
//         { align: 'right' }
//       );
//     }

//     // Save the PDF with timestamp
//     doc.save(`energy-survey-${new Date().toISOString().split('T')[0]}.pdf`);
//   }, []);

//   // Handle PDF download
//   const handleDownloadPdf = useCallback(() => {
//     generatePdf(survey);
//   }, [survey, generatePdf]);

//   // Load survey data
//   useEffect(() => {
//     const loadSurveyData = async () => {
//       if (!scanId) {
//         navigate('/scan');
//         return;
//       }
      
//       try {
//         const scanData = await getScanData(scanId);
//         if (scanData?.survey) {
//           setSurvey(scanData.survey);
//         }
//       } catch (error) {
//         console.error('Failed to load survey data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadSurveyData();
//   }, [scanId, navigate]);

//   // Auto-download PDF when survey data is loaded
//   useEffect(() => {
//     if (!isLoading && Object.keys(survey).length > 0) {
//       handleDownloadPdf();
//       // Navigate back after a short delay to allow download to start
//       const timer = setTimeout(() => {
//         navigate(`/findings?scanId=${scanId}`);
//       }, 1000);
      
//       return () => clearTimeout(timer);
//     }
//   }, [isLoading, survey, handleDownloadPdf, navigate, scanId]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//           <p>Preparing your energy survey report...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-2xl mx-auto">
//         <div className="flex items-center gap-4 mb-6">
//           <Button variant="outline" size="icon" onClick={() => navigate(`/findings?scanId=${scanId}`)}>
//             <ArrowLeft className="w-4 h-4" />
//           </Button>
//           <h1 className="text-2xl font-bold">Generating Your Report</h1>
//         </div>

//         <Card>
//           <CardContent className="p-6 space-y-6 text-center">
//             <div className="py-8">
//               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Download className="w-8 h-8 text-green-600" />
//               </div>
//               <h2 className="text-xl font-semibold mb-2">Your Report is Ready!</h2>
//               <p className="text-gray-600 mb-6">Your energy survey report is being downloaded automatically.</p>
              
//               <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
//                 <p className="text-sm text-gray-600 mb-2">If the download doesn't start automatically, click below:</p>
//                 <Button 
//                   onClick={handleDownloadPdf}
//                   className="w-full sm:w-auto"
//                 >
//                   <Download className="w-4 h-4 mr-2" />
//                   Download Report
//                 </Button>
//               </div>
              
//               <p className="mt-6 text-sm text-gray-500">
//                 You will be redirected to the findings page in a moment...
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


// src/pages/Survey.tsx
// import { useEffect, useCallback } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { ArrowLeft, Download } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { toast } from 'sonner';              // 🔸 real-time suggestions
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { getScanData } from '@/lib/storage';

// type SurveyData = Record<string, string>;

// /* ------------------------------------------------------------------ */
// /*  reusable hook that streams suggestions as toasts every N seconds  */
// /* ------------------------------------------------------------------ */
// const useStreamingTips = (tips: string[], delayMs = 2500) => {
//   useEffect(() => {
//     if (!tips.length) return;
//     let idx = 0;
//     const id = setInterval(() => {
//       toast.info(tips[idx], { duration: delayMs + 500 });
//       idx = (idx + 1) % tips.length;
//     }, delayMs);
//     return () => clearInterval(id);
//   }, [tips, delayMs]);
// };

// /* ----------------------------- Component -------------------------- */
// export function Survey() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const scanId = searchParams.get('scanId');

//   // -----------------------------------------------------------------
//   // 1️⃣  Energy-saving suggestions (rendered as toasts)
//   // -----------------------------------------------------------------
//   const tips = [
//     'Seal gaps around doors & windows with weather-stripping.',
//     'Upgrade to LED bulbs – they use 75 % less energy.',
//     'Replace or clean HVAC filters every 3 months.',
//     'Install a smart thermostat to trim heating/cooling costs.',
//     'Add attic insulation up to at least R-38.',
//     'Choose ENERGY STAR appliances when replacing units.',
//     'Fix leaky faucets – 1 drip/sec ≈ 3 000 L/yr!',
//     'Lower your water-heater to 49 °C (120 °F).'
//   ];
//   useStreamingTips(tips, 3000);              // ⬅️ start streaming tips

//   // -----------------------------------------------------------------
//   // 2️⃣  PDF generator (unchanged except extracted outside render)
//   // -----------------------------------------------------------------
//   const generatePdf = useCallback((data: SurveyData) => {
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const margin = 16;

//     doc.setFontSize(20).setTextColor('#1e64c8');
//     doc.text('Home Energy Survey Report', pageWidth / 2, 24, { align: 'center' });
//     doc.setFontSize(10).setTextColor('#666');
//     doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 34);

//     const fields = [
//       { key: 'tenure', label: 'Property Tenure' },
//       { key: 'occupants', label: 'Number of Occupants' },
//       { key: 'heatingType', label: 'Heating Type' },
//       { key: 'coolingType', label: 'Cooling Type' },
//       { key: 'monthlyBill', label: 'Monthly Energy Bill' },
//       { key: 'windowAge', label: 'Window Age' },
//       { key: 'draftFeelings', label: 'Draft Feelings' }
//     ];
//     autoTable(doc, {
//       startY: 42,
//       head: [['Category', 'Your Response']],
//       body: fields.map(f => [f.label, data[f.key] || 'Not specified']),
//       theme: 'grid',
//       styles: { fontSize: 11 },
//       headStyles: { fillColor: [30, 100, 200] },
//       margin: { left: margin, right: margin }
//     });

//     // tips page (if needed)
//     const last = doc.getLastAutoTable()?.finalY ?? 42;
//     let y = last + 10;
//     if (y > 250) { doc.addPage(); y = 20; }
//     doc.setFontSize(16).setTextColor('#1e64c8');
//     doc.text('Energy Saving Tips', margin, y);
//     y += 8;
//     autoTable(doc, {
//       startY: y,
//       head: [['#', 'Tip']],
//       body: tips.map((t, i) => [i + 1, t]),
//       theme: 'grid',
//       styles: { fontSize: 10 },
//       headStyles: { fillColor: [30, 100, 200] },
//       margin: { left: margin, right: margin }
//     });

//     const pages = doc.getNumberOfPages();
//     for (let i = 1; i <= pages; i++) {
//       doc.setPage(i);
//       doc.setFontSize(8).setTextColor('#666');
//       doc.text(`Page ${i} of ${pages}`, pageWidth - margin,
//         doc.internal.pageSize.getHeight() - 8, { align: 'right' });
//     }
//     doc.save(`energy-survey-${new Date().toISOString().split('T')[0]}.pdf`);
//   }, [tips]);

//   // -----------------------------------------------------------------
//   // 3️⃣  On first mount: load stored data ➜ generate PDF ➜ redirect
//   // -----------------------------------------------------------------
//   useEffect(() => {
//     (async () => {
//       if (!scanId) { navigate('/scan'); return; }
//       try {
//         const stored = await getScanData(scanId);
//         generatePdf(stored?.survey ?? {});   // even if blank, still works
//         toast.success('📄 PDF download started');
//       } catch (e) {
//         toast.error('Failed to generate report');
//         console.error(e);
//       } finally {
//         setTimeout(() => navigate(`/findings?scanId=${scanId}`), 1500);
//       }
//     })();
//   }, [scanId, generatePdf, navigate]);

//   /* -----------------------------------------------------------------
//      4️⃣  Super-simple placeholder UI (spinners & manual download btn)
//      ----------------------------------------------------------------- */
//   return (
//     <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
//       <Card className="w-full max-w-md text-center">
//         <CardContent className="p-6 space-y-6">
//           <ArrowLeft
//             className="w-6 h-6 absolute left-4 top-4 cursor-pointer"
//             onClick={() => navigate(`/findings?scanId=${scanId}`)}
//           />
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2
//                           border-primary mx-auto" />
//           <h2 className="text-xl font-semibold">Creating your PDF…</h2>

//           <Button variant="outline" onClick={() => {
//             toast.info('Regenerating PDF…');
//             (async () => {
//               const data = await getScanData(scanId as string);
//               generatePdf(data?.survey ?? {});
//             })();
//           }}>
//             <Download className="w-4 h-4 mr-2" />
//             Download again
//           </Button>

//           <p className="text-sm text-gray-500">
//             Energy-saving tips are streaming ⬆️ while you wait.
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// -----------------------------------------------------------------------------
//  src/pages/Survey.tsx   (पूरा फाइल कॉपी-पेस्ट करें)
// -----------------------------------------------------------------------------
import React, { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';                           // <-- plugin registers here
import { getScanData } from '@/lib/storage';

type SurveyData = Record<string, string>;

/* ───────────────────────── Streaming tip hook ───────────────────────── */
const useStreamingTips = (tips: string[], delayMs = 2500) => {
  useEffect(() => {
    if (!tips.length) return;
    let idx = 0;
    const id = setInterval(() => {
      toast.info(tips[idx], { duration: delayMs + 600 });
      idx = (idx + 1) % tips.length;
    }, delayMs);
    return () => clearInterval(id);
  }, [tips, delayMs]);
};

/* ──────────────────────────── Component ────────────────────────────── */
export function Survey() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('scanId');

  const tips = [
    'Seal gaps around doors & windows with weather-stripping.',
    'Upgrade to LED bulbs – they use 75 % less energy.',
    'Replace or clean HVAC filters every 3 months.',
    'Install a smart thermostat to trim heating/cooling costs.',
    'Add attic insulation up to at least R-38.',
    'Choose ENERGY STAR appliances when replacing units.',
    'Fix leaky faucets – 1 drip/sec ≈ 3 000 L/yr!',
    'Lower your water-heater to 49 °C (120 °F).'
  ];
  useStreamingTips(tips, 3000);

/* ────────────────────── PDF generator (no TypeError) ────────────────── */
  const generatePdf = useCallback((data: SurveyData) => {
    const doc       = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin    = 16;

    /* header */
    doc.setFontSize(20).setTextColor('#1e64c8');
    doc.text('Home Energy Survey Report', pageWidth / 2, 24, { align: 'center' });
    doc.setFontSize(10).setTextColor('#666');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 34);

    /* first table: captured fields */
    const fields = [
      { key: 'tenure',        label: 'Property Tenure' },
      { key: 'occupants',     label: 'Number of Occupants' },
      { key: 'heatingType',   label: 'Heating Type' },
      { key: 'coolingType',   label: 'Cooling Type' },
      { key: 'monthlyBill',   label: 'Monthly Energy Bill' },
      { key: 'windowAge',     label: 'Window Age' },
      { key: 'draftFeelings', label: 'Draft Feelings' }
    ];

    doc.autoTable({
      startY    : 42,
      head      : [['Category', 'Your Response']],
      body      : fields.map(f => [f.label, data[f.key] || 'Not specified']),
      theme     : 'grid',
      styles    : { fontSize: 11 },
      headStyles: { fillColor: [30, 100, 200] },
      margin    : { left: margin, right: margin }
    });

    /* position after first table */
    const lastY = (doc as any).lastAutoTable?.finalY ?? 42;
    let y       = lastY + 10;
    if (y > 250) { doc.addPage(); y = 20; }

    /* tips heading & table */
    doc.setFontSize(16).setTextColor('#1e64c8');
    doc.text('Energy Saving Tips', margin, y);
    y += 8;
    doc.autoTable({
      startY    : y,
      head      : [['#', 'Tip']],
      body      : tips.map((t, i) => [i + 1, t]),
      theme     : 'grid',
      styles    : { fontSize: 10 },
      headStyles: { fillColor: [30, 100, 200] },
      margin    : { left: margin, right: margin }
    });

    /* footer page numbers */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8).setTextColor('#666');
      doc.text(
        `Page ${i} of ${pages}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'right' }
      );
    }

    doc.save(`energy-survey-${new Date().toISOString().split('T')[0]}.pdf`);
  }, [tips]);

/* ────── first mount → load data → generate PDF → redirect ───────────── */
  useEffect(() => {
    const run = async () => {
      if (!scanId) { navigate('/scan'); return; }
      try {
        const stored = await getScanData(scanId);
        generatePdf(stored?.survey ?? {});      // even if empty object
        toast.success('📄 Report download started');
      } catch (err) {
        toast.error('Failed to generate report');
        console.error(err);
      } finally {
        setTimeout(() => navigate(`/findings?scanId=${scanId}`), 1500);
      }
    };
    run();
  }, [scanId, generatePdf, navigate]);

/* ──────────────────────────── UI skeleton ──────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md text-center relative">
        <ArrowLeft
          className="w-6 h-6 absolute left-4 top-4 cursor-pointer"
          onClick={() => navigate(`/findings?scanId=${scanId}`)}
        />
        <CardContent className="p-6 space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2
                          border-primary mx-auto" />
          <h2 className="text-xl font-semibold">Creating your PDF…</h2>

          <Button variant="outline" onClick={async () => {
            toast.info('Regenerating PDF…');
            const data = await getScanData(scanId as string);
            generatePdf(data?.survey ?? {});
          }}>
            <Download className="w-4 h-4 mr-2" />
            Download again
          </Button>

          <p className="text-sm text-gray-500">
            Energy-saving tips are streaming while you wait.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
