import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Shield, Gift, FileText, Zap, Leaf, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useTranslation } from 'react-i18next';

export function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Camera,
      title: t('home.features.camera'),
      description: t('home.features.cameraDesc'),
      color: 'bg-blue-100 text-blue-800'
    },
    {
      icon: Shield,
      title: t('home.features.privacy'),
      description: t('home.features.privacyDesc'),
      color: 'bg-green-100 text-green-800'
    },
    {
      icon: Gift,
      title: t('home.features.rebates'),
      description: t('home.features.rebatesDesc'),
      color: 'bg-purple-100 text-purple-800'
    },
    {
      icon: FileText,
      title: t('home.features.report'),
      description: t('home.features.reportDesc'),
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Zap className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('home.title')}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>

          <Button size="lg" asChild className="mb-4">
            <Link to="/scan" className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {t('home.startScan')}
            </Link>
          </Button>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>100% Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              <span>Eco-Friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Save Money</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.color} mx-auto flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start Guide */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Scan Your Home</h3>
                <p className="text-sm text-muted-foreground">Use your camera to capture windows, doors, and appliances</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Get Analysis</h3>
                <p className="text-sm text-muted-foreground">AI identifies energy inefficiencies and potential savings</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Access Rebates</h3>
                <p className="text-sm text-muted-foreground">Find relevant rebates and incentives for improvements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">{t('home.recentReports')}</h2>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">{t('home.noReports')}</p>
              <Button className="mt-4" asChild>
                <Link to="/scan">{t('home.startScan')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}