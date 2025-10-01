import { useState } from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Header from './components/HeaderV';
import HomePage from './pages/HomePageV';
import InfrastructurePage from './pages/InfrastructurePageV';
import PersonalPage from './pages/PersonalPageV';

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState("Все районы");
  return (
    <Router>
      <div className="App h-full w-full flex flex-col overflow-hidden">
        <Header setSelectedDistrict={setSelectedDistrict} selectedDistrict={selectedDistrict}/>
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage selectedDistrict={selectedDistrict} />}/>
            <Route path="/infrastructure" element={<InfrastructurePage/>}/>
            <Route path="/personal" element={<PersonalPage selectedDistrict={selectedDistrict}/>}/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
