import React from 'react'
import Footer from './component/ToolSelectionArea.js'
import CanvasGrid from './component/DrawingArea.js'
import "./App.css"
import { useState} from 'react';


export default function App() {
    const [mode, setMode] = useState('pan');
    
    return (
        <div className="App">
        <div className="canvas-container">
          <CanvasGrid mode={mode} />
        </div>
          <Footer mode={mode} setMode={setMode}/>
      </div>
    )
}