import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RebateCard } from '../components/RebateCard';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Import rebate data
import rebatesData from '../data/rebates.json';

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
}

export function Rebates() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [rebates, setRebates] = useState<Rebate[]>(rebatesData);
  const [filteredRebates, setFilteredRebates] = useState<Rebate[]>(rebatesData);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userProfile, setUserProfile] = useState<Record<string, any> | null>(null);

  // Get unique regions and categories
  const regions = Array.from(new Set(rebates.flatMap(r => r.region)));
  const categories = Array.from(new Set(rebates.map(r => r.category)));

  useEffect(() => {
    let filtered = rebates;

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(rebate => rebate.region.includes(selectedRegion));
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rebate => rebate.category === selectedCategory);
    }

    setFilteredRebates(filtered);
  }, [rebates, selectedRegion, selectedCategory]);

  const handleCheckEligibility = (rebateId: string) => {
    // In a real app, this would open a modal to collect user information
    // For now, we'll simulate some user profile data
    setUserProfile({
      income: 75000,
      isHomeowner: true,
      location: 'rural',
      state: 'NSW'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t('rebates.title')}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{filteredRebates.length}</div>
              <div className="text-sm text-muted-foreground">Available Rebates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${filteredRebates.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{regions.length}</div>
              <div className="text-sm text-muted-foreground">States/Territories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Rebates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rebates Grid */}
        {filteredRebates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRebates.map(rebate => (
              <RebateCard
                key={rebate.id}
                rebate={rebate}
                onCheckEligibility={handleCheckEligibility}
                userProfile={userProfile}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No Rebates Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to see more rebates.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRegion('all');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}