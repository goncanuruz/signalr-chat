import "./App.css";
import ChatPage from "./pages/chat";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "react-perfect-scrollbar/dist/css/styles.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatPage />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
