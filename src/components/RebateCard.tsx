import React from 'react';
import { ExternalLink, Calendar, MapPin, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

interface Rebate {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: 'rebate' | 'grant' | 'package';
  category: string;
  region: string[];
  eligibility: Record<string, any>;
  tags: string[];
  applicationUrl: string;
  deadline: string;
  processingTime: string;
  isEligible?: boolean;
}

interface RebateCardProps {
  rebate: Rebate;
  onCheckEligibility?: (rebateId: string) => void;
  userProfile?: Record<string, any>;
}

export function RebateCard({ rebate, onCheckEligibility, userProfile }: RebateCardProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rebate': return 'bg-blue-100 text-blue-800';
      case 'grant': return 'bg-green-100 text-green-800';
      case 'package': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const checkEligibility = () => {
    // Simple eligibility check based on user profile
    // In a real app, this would be more sophisticated
    if (!userProfile) return null;

    const criteria = rebate.eligibility;
    let eligible = true;
    const reasons: string[] = [];

    // Check income threshold
    if (criteria.income_threshold && userProfile.income > criteria.income_threshold) {
      eligible = false;
      reasons.push(`Income exceeds ${formatCurrency(criteria.income_threshold)}`);
    }

    // Check homeowner status
    if (criteria.homeowner && !userProfile.isHomeowner) {
      eligible = false;
      reasons.push('Must be a homeowner');
    }

    // Check location
    if (criteria.location === 'rural' && userProfile.location !== 'rural') {
      eligible = false;
      reasons.push('Must be in rural area');
    }

    return { eligible, reasons };
  };

  const eligibilityResult = userProfile ? checkEligibility() : null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg line-clamp-2">{rebate.title}</CardTitle>
          <div className="flex flex-col items-end gap-1">
            <Badge className={getTypeColor(rebate.type)}>
              {rebate.type.toUpperCase()}
            </Badge>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(rebate.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Eligibility Status */}
        {eligibilityResult && (
          <div className={`flex items-center gap-2 p-2 rounded-lg ${
            eligibilityResult.eligible 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {eligibilityResult.eligible ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {eligibilityResult.eligible 
                ? t('rebates.eligible') 
                : t('rebates.notEligible')
              }
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {rebate.description}
        </p>

        {/* Key Information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{rebate.region.join(', ')}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Deadline: {formatDate(rebate.deadline)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span>Processing: {rebate.processingTime}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {rebate.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Eligibility Issues */}
        {eligibilityResult && !eligibilityResult.eligible && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Eligibility Issues:</h4>
            <ul className="text-xs text-red-700 space-y-1">
              {eligibilityResult.reasons.map((reason, index) => (
                <li key={index} className="flex items-center gap-1">
                  <span>•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          {!userProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCheckEligibility?.(rebate.id)}
              className="flex-1"
            >
              {t('rebates.checkEligibility')}
            </Button>
          )}
          
          <Button
            size="sm"
            className="flex-1"
            disabled={eligibilityResult && !eligibilityResult.eligible}
            asChild
          >
            <a 
              href={rebate.applicationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {t('rebates.applyNow')}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}