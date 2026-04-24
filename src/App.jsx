import { useState } from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/comps/HeaderV';
import HomePage from './pages/HomePageV';
import InfrastructurePage from './pages/InfrastructurePageV';
import PersonalPage from './pages/PersonalPageV';
import GeoAnalysisPage from './pages/GeoAnalysisPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Данные считаются "свежими" всегда (не перезапрашивать)
      gcTime: 1000 * 60 * 60 * 24, // Хранить в памяти 24 часа
      refetchOnWindowFocus: false, // Не делать запрос при возврате на вкладку
      retry: 1, // Повторить 1 раз при ошибке
    },
  },
});

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState("Все районы");
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App h-full w-full flex flex-col overflow-hidden">
          <Header setSelectedDistrict={setSelectedDistrict} selectedDistrict={selectedDistrict}/>
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<HomePage selectedDistrict={selectedDistrict} />}/>
              <Route path="/buildings" element={<InfrastructurePage/>}/>
              <Route path="/personal" element={<PersonalPage selectedDistrict={selectedDistrict}/>}/>
              <Route path="/geo-analysis" element={<GeoAnalysisPage/>}/>
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
