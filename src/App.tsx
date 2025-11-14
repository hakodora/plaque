import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import SelfEvolutionPage from "@/pages/SelfEvolutionPage";
import PitchDeck from "@/pages/PitchDeck";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/evolution" element={<SelfEvolutionPage />} />
        <Route path="/pitchdeck" element={<PitchDeck />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
