import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, DollarSign, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

interface Finding {
  id: string;
  type: 'window' | 'door' | 'appliance' | 'insulation' | 'lighting';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  title: string;
  description: string;
  estimatedCost?: number;
  annualSavings?: number;
  paybackPeriod?: number;
  location?: string;
  imageUrl?: string;
  confirmed?: boolean;
  userNotes?: string;
}

interface FindingCardProps {
  finding: Finding;
  onConfirm?: (id: string, confirmed: boolean) => void;
  onAddNote?: (id: string, note: string) => void;
}

export function FindingCard({ finding, onConfirm, onAddNote }: FindingCardProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(finding.userNotes || '');

  const getSeverityColor = (severity: Finding['severity']) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: Finding['severity']) => {
    return <AlertTriangle className="w-4 h-4" />;
  };

  const handleSaveNote = () => {
    onAddNote?.(finding.id, noteText);
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <Card className={`transition-all duration-200 ${finding.confirmed ? 'ring-2 ring-green-200 bg-green-50/50' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getSeverityIcon(finding.severity)}
            {finding.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={getSeverityColor(finding.severity)}>
              {t(`findings.severity.${finding.severity}`)}
            </Badge>
            <Badge variant="outline">
              {Math.round(finding.confidence * 100)}% {t('findings.confidence')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {finding.description}
        </p>

        {finding.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {finding.location}
          </div>
        )}

        {/* Cost and Savings Information */}
        {(finding.estimatedCost || finding.annualSavings || finding.paybackPeriod) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
            {finding.estimatedCost && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('findings.estimatedCost')}</p>
                  <p className="font-medium">{formatCurrency(finding.estimatedCost)}</p>
                </div>
              </div>
            )}

            {finding.annualSavings && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('findings.annualSavings')}</p>
                  <p className="font-medium">{formatCurrency(finding.annualSavings)}</p>
                </div>
              </div>
            )}

            {finding.paybackPeriod && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('findings.paybackPeriod')}</p>
                  <p className="font-medium">
                    {finding.paybackPeriod === Infinity 
                      ? 'N/A' 
                      : `${finding.paybackPeriod} years`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Notes Section */}
        <div className="border-t pt-4">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t('findings.notes')}
                className="w-full min-h-[80px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNote}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {finding.userNotes ? (
                <div className="mb-2">
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{finding.userNotes}</p>
                </div>
              ) : null}
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsEditing(true)}
                className="text-xs"
              >
                {finding.userNotes ? 'Edit Note' : 'Add Note'}
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant={finding.confirmed ? "default" : "outline"}
            onClick={() => onConfirm?.(finding.id, !finding.confirmed)}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {finding.confirmed ? t('findings.confirmed') : 'Confirm'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}