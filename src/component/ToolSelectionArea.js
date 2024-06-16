// import React from 'react'

// export default function Footer({mode,setMode}) {
  
//   const x1 = 10;
//   const y1 = 10;
//   const x2 = 50;
//   const y2 = 10;
//   const toggleMode = () => {
//     setMode(mode === 'draw' ? 'pan' : 'draw');
//   };
//   return (
//     <div className="footer">
//     <svg width="100" height="20" cursor={"pointer"} onClick={toggleMode}>
//       <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={"black"} strokeWidth={mode==="draw"?"3":"1"} />
//       <circle cx={x1} cy={y1} r="3" fill="black" />
//       <circle cx={x2} cy={y2} r="3" fill="black" />
//     </svg>
//     </div>
//   )
// }


    
import React, { useEffect, useRef } from 'react';

export default function Footer({ mode, setMode }) {
  const canvasRef = useRef(null);

  const x1 = 10;
  const y1 = 10;
  const x2 = 50;
  const y2 = 10;

  const toggleMode = () => {
    setMode(mode === 'draw' ? 'pan' : 'draw');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = mode === 'draw' ? 3 : 1;
    ctx.stroke();

    // Draw the circles
    ctx.beginPath();
    ctx.arc(x1, y1, 3, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x2, y2, 3, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
  }, [mode, x1, y1, x2, y2]);

  return (
    <div className="footer" onClick={toggleMode} style={{ cursor: 'pointer' }}>
      <canvas ref={canvasRef} width="100" height="20" />
    </div>
  );
}
