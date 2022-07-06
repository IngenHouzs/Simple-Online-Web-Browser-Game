import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Form from "./pages/Form";
import Application from './pages/Application';
import {socketIOClient, socket, ENDPOINT} from "./ClientSocket";

import "./index.css";

function App() {

  const loginCard = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(()=>{
    socket.on('connection', data => console.log(data, "wkwkwk"));
    // location.reload();
    setIsLoggedIn(false);
  });

  useEffect(() => {
    document.getElementsByTagName('body')[0].style.overflowY = 'hidden';  
  },[])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Form targetAPI="http://localhost:8080/login" type="Log In" setIsLoggedIn={setIsLoggedIn}/>}/>
        <Route path="/signup" element={<Form targetAPI="http://localhost:8080/signup" type="Sign Up" setIsLoggedIn={setIsLoggedIn}/>}/> 
        <Route path="/app" element={<Application targetAPI="http://localhost:8080/app" loginCard={loginCard}/>}/>        
      </Routes>    

    {!isLoggedIn ? 
      <div className="prelogin-wrapper" ref={loginCard}>
        <h1 className="title">Welcome!</h1>     
        <Link to="/login"><button>Login</button></Link>
        <Link to="/signup"><button>Sign Up</button></Link>    
        <h1 className="copyright">Copyright 2022 &copy; IngenHouzs</h1>
      </div>    
    : null}
    </Router>
  );
}

export default App;
