import React from 'react';
import { BrowserRouter as Router, Route, Routes, HashRouter } from 'react-router-dom';
import TopStripComponent from './TopStripComponent';
import Component1 from './Component1';
import CircleMovingArea from './Component2';
import TonDns from './TonDns';
import './styles/App.css';

const App = () => {
  return (
    <HashRouter>
      <div>
        <TopStripComponent />
        <div className='main'>
          <Routes>
            <Route path="/component1" element={<Component1 />} />
            <Route path="/circles" element={<CircleMovingArea />} />
            <Route path="/ton/dns" element={<TonDns />} />
            <Route path='/' element={<p>Hello</p>} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
