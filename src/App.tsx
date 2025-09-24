import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { Checklist } from './pages/Checklist';
import { Rebates } from './pages/Rebates';
import './lib/i18n';
import { Toaster } from 'sonner';
import { Survey } from './pages/Survey';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/rebates" element={<Rebates />} />
            <Route path="/survey" element={<Survey />} />
          </Routes>
          <Toaster richColors />
        </div>
        
      </Router>
    </QueryClientProvider>
  );
}

export default App;