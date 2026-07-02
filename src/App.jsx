import { useState } from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/comps/HeaderV';
import HomePage from './pages/HomePageV';
import InfrastructurePage from './pages/InfrastructurePageV';
import PersonalPage from './pages/PersonalPageV';
import RecomendationsPage from './pages/RecomendationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState("Все районы");
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/healthcare-territorial">
        <div className="App h-full w-full flex flex-col overflow-hidden">
          <Header setSelectedDistrict={setSelectedDistrict} selectedDistrict={selectedDistrict}/>
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<HomePage selectedDistrict={selectedDistrict} />}/>
              <Route path="/infrastructure" element={<InfrastructurePage/>}/>
              <Route path="/personal" element={<PersonalPage selectedDistrict={selectedDistrict}/>}/>
              <Route path="/recomendations" element={<RecomendationsPage/>}/>
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
