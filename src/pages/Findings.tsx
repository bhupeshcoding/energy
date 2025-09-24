import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { generatePdfReport } from '../lib/reportService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FindingCard } from '../components/FindingCard';
import { useTranslation } from 'react-i18next';
import { getScanData, saveScanData } from '../lib/storage';
import { EnergyFinding, calculateAnnualSavings, calculatePaybackPeriod } from '../lib/energy';

export function Findings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('scanId');
  
  const [findings, setFindings] = useState<EnergyFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<any>(null);

  useEffect(() => {
    if (!scanId) {
      navigate('/scan');
      return;
    }
    
    const loadData = async () => {
      const scanData = await getScanData(scanId);
      if (scanData?.survey) {
        setSurveyData(scanData.survey);
      }
      loadFindings();
    };
    
    loadData();
  }, [scanId, navigate]);

  const loadFindings = async () => {
    if (!scanId) return;
    
    const scanData = await getScanData(scanId);
    if (scanData?.findings) {
      // Enhance findings with calculated savings and payback
      const enhancedFindings = scanData.findings.map((finding: EnergyFinding) => ({
        ...finding,
        annualSavings: calculateAnnualSavings(finding),
        paybackPeriod: calculatePaybackPeriod(finding.estimatedCost || 0, calculateAnnualSavings(finding))
      }));
      
      // Sort by priority (high severity first, then by potential savings)
      const sortedFindings = enhancedFindings.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        return (b.annualSavings || 0) - (a.annualSavings || 0);
      });
      
      setFindings(sortedFindings);
    }
    setLoading(false);
  };

  const handleConfirm = async (id: string, confirmed: boolean) => {
    const updatedFindings = findings.map(f => 
      f.id === id ? { ...f, confirmed } : f
    );
    setFindings(updatedFindings);
    
    // Save to storage
    if (scanId) {
      const scanData = await getScanData(scanId);
      if (scanData) {
        await saveScanData({
          ...scanData,
          findings: updatedFindings
        });
      }
    }
  };

  const handleAddNote = async (id: string, note: string) => {
    const updatedFindings = findings.map(f => 
      f.id === id ? { ...f, userNotes: note } : f
    );
    setFindings(updatedFindings);
    
    // Save to storage
    if (scanId) {
      const scanData = await getScanData(scanId);
      if (scanData) {
        await saveScanData({
          ...scanData,
          findings: updatedFindings
        });
      }
    }
  };

  const handleGenerateReport = () => {
    if (!scanId) return;
    
    const confirmedFindings = findings.filter(f => f.confirmed);
    const totalSavings = confirmedFindings.reduce((sum, f) => sum + (f.annualSavings || 0), 0);
    const totalCost = confirmedFindings.reduce((sum, f) => sum + (f.estimatedCost || 0), 0);
    const paybackPeriod = totalSavings > 0 ? totalCost / totalSavings : 0;
    
    generatePdfReport({
      scanId,
      findings: confirmedFindings,
      surveyData,
      totalSavings,
      totalCost,
      paybackPeriod
    });
  };

  const confirmedFindings = findings.filter(f => f.confirmed);
  const totalPotentialSavings = confirmedFindings.reduce((sum, f) => sum + (f.annualSavings || 0), 0);
  const totalEstimatedCost = confirmedFindings.reduce((sum, f) => sum + (f.estimatedCost || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading findings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(`/survey?scanId=${scanId}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{t('findings.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {findings.length} issues identified • {confirmedFindings.length} confirmed
            </p>
          </div>
        </div>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Energy Efficiency Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${totalPotentialSavings.toFixed(0)}
                </div>
                <div className="text-sm text-green-700">Annual Potential Savings</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${totalEstimatedCost.toFixed(0)}
                </div>
                <div className="text-sm text-blue-700">Total Investment</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {totalEstimatedCost > 0 ? (totalEstimatedCost / totalPotentialSavings).toFixed(1) : '0'}
                </div>
                <div className="text-sm text-purple-700">Years Payback</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Findings List */}
        {findings.length > 0 ? (
          <div className="space-y-4 mb-6">
            {findings.map(finding => (
              <FindingCard
                key={finding.id}
                finding={finding}
                onConfirm={handleConfirm}
                onAddNote={handleAddNote}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold mb-2">Great News!</h3>
              <p className="text-muted-foreground mb-4">
                No major energy efficiency issues were detected in your scan. 
                Your home appears to be well-maintained from an energy perspective.
              </p>
              <Button onClick={() => navigate('/rebates')}>
                Explore Available Rebates
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {findings.length > 0 && (
          <div className="flex gap-4">
            <Button 
              onClick={handleGenerateReport} 
              className="flex-1"
              disabled={findings.filter(f => f.confirmed).length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              {findings.filter(f => f.confirmed).length > 0 
                ? `Download PDF Report (${findings.filter(f => f.confirmed).length} actions)`
                : 'Select actions to generate report'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/rebates')} className="flex-1">
              View Rebates
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}