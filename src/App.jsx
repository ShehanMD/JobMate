import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<h1 style={{ padding: "40px" }}>Home Page</h1>} />
            <Route path="/jobs" element={<h1 style={{ padding: "40px" }}>Find Jobs Page</h1>} />
            <Route path="/workers" element={<h1 style={{ padding: "40px" }}>Skilled Workers Page</h1>} />
            <Route path="/about" element={<h1 style={{ padding: "40px" }}>About Page</h1>} />
            <Route path="/contact" element={<h1 style={{ padding: "40px" }}>Contact Page</h1>} />
            <Route path="/login" element={<h1 style={{ padding: "40px" }}>Sign In Page</h1>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;