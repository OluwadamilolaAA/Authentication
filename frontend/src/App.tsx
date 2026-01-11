import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Signup } from "./components/signup-form";
import { Login } from "./components/login-form";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/admin" element={<div>Admin Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;
