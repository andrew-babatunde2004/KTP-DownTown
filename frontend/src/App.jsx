import { Routes, Route, Link } from "react-router-dom";
import SendAlert from "./pages/SendAlert";
import RespondAlert from "./pages/RespondAlert";

export default function App() {
  return (
    <div className="site-shell">
      <nav className="top-nav">
        <Link to="/" className="nav-link">Send Alert</Link>
        <Link to="/respond" className="nav-link">Respond to Alert</Link>
      </nav>

      <Routes>
        <Route path="/" element={<SendAlert />} />
        <Route path="/respond" element={<RespondAlert />} />
      </Routes>
    </div>
  );
}