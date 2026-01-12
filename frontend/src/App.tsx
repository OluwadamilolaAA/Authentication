import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Signup } from "./components/signup-form";
import { Login } from "./components/login-form";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<h1 className="text-center mt-20">Home Page</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
