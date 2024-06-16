import React, { useRef, useState, useEffect } from "react";
import {
  getCanvasCoordinates,
  findNearestPoint,
  generatePointName,
  redrawCanvas,
  isPointNearLine,
} from "../helpers";

const CanvasGrid = ({ mode }) => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [lines, setLines] = useState([]);
  const [points, setPoints] = useState([]);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [nameIndex, setNameIndex] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanX, setLastPanX] = useState(0);
  const [lastPanY, setLastPanY] = useState(0);

  const dotRadius = 0.5;
  const snapThreshold = 10;
  const dotSpacing = 10;

  const redraw = (newPoints = points, newlines = lines) => {
    redrawCanvas(
      canvasRef.current,
      newPoints,
      newlines,
      startX,
      startY,
      currentX,
      currentY,
      panX,
      panY,
      scale,
      isDrawing,
      dotSpacing,
      dotRadius
    );
  };

  const pointerPressDown = (event) => {
    const { x, y } = getCanvasCoordinates(event, canvasRef.current);
    if (mode === "pan") {
      setIsPanning(true);
      setLastPanX(x);
      setLastPanY(y);
    } else {
      setIsDrawing(true);
      const adjustedX = (x - panX) / scale;
      const adjustedY = (y - panY) / scale;
      console.log(panX, panY)
      console.log(lines)
      const nearestPoint = findNearestPoint(
        points,
        adjustedX,
        adjustedY,
        snapThreshold,
        scale
      );
      if (nearestPoint) {
        setStartX(nearestPoint.x);
        setStartY(nearestPoint.y);
      } else {
        setStartX(adjustedX);
        setStartY(adjustedY);
      }

      setCurrentX(adjustedX);
      setCurrentY(adjustedY);
    }
  };

  const pointerMove = (event) => {
    if (isPanning) {
      const { x, y } = getCanvasCoordinates(event, canvasRef.current);
      setPanX(panX + (x - lastPanX));
      setPanY(panY + (y - lastPanY));
      setLastPanX(x);
      setLastPanY(y);
    } else if (isDrawing) {
      const { x, y } = getCanvasCoordinates(event, canvasRef.current);
      setCurrentX((x - panX) / scale);
      setCurrentY((y - panY) / scale);
    }
    redraw();
  };

  const releasePointer = () => {
    if (isPanning) {
      setIsPanning(false);
    } else if (isDrawing) {
      setIsDrawing(false);
      const adjustedX = currentX;
      const adjustedY = currentY;

      const startNearestPoint = findNearestPoint(
        points,
        startX,
        startY,
        snapThreshold,
        scale
      );

      const endNearestPoint = findNearestPoint(
        points,
        adjustedX,
        adjustedY,
        snapThreshold,
        scale
      );

      const finalStartX = startNearestPoint ? startNearestPoint.x : startX;
      const finalStartY = startNearestPoint ? startNearestPoint.y : startY;
      const finalEndX = endNearestPoint ? endNearestPoint.x : adjustedX;
      const finalEndY = endNearestPoint ? endNearestPoint.y : adjustedY;

      const newLine = {
        startX: finalStartX,
        startY: finalStartY,
        endX: finalEndX,
        endY: finalEndY,
      };

      let direction = [1, 1];
      if (finalStartX > finalEndX) direction[0] = 1;
      else direction[0] = -1;
      if (finalStartY > finalEndY) direction[1] = 1;
      else direction[1] = -1;

      const lengthInUnits = (
        Math.hypot(finalEndX - finalStartX, finalEndY - finalStartY) /
        (dotSpacing * 4)
      ).toFixed(1);
      newLine.length = lengthInUnits;

      setLines([...lines, newLine]);

      if (!startNearestPoint) {
        const newPointNameStart = generatePointName(nameIndex);
        setPoints([
          ...points,
          {
            x: finalStartX,
            y: finalStartY,
            name: newPointNameStart,
            direction: direction,
          },
        ]);
      }

      if (!endNearestPoint) {
        if (!startNearestPoint) {
          const newPointNameStart = generatePointName(nameIndex);
          const newPointNameEnd = generatePointName(nameIndex + 1);
          setNameIndex(nameIndex + 2);
          setPoints([
            ...points,
            {
              x: finalStartX,
              y: finalStartY,
              name: newPointNameStart,
              direction: direction,
            },
            {
              x: finalEndX,
              y: finalEndY,
              name: newPointNameEnd,
              direction: [direction[0] * -1, direction[1] * -1],
            },
          ]);
        } else {
          const newPointNameEnd = generatePointName(nameIndex);
          setNameIndex(nameIndex + 1);
          setPoints([
            ...points,
            {
              x: finalEndX,
              y: finalEndY,
              name: newPointNameEnd,
              direction: [direction[0] * -1, direction[1] * -1],
            },
          ]);
        }
      }

      redraw();
    }
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    redraw();
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const { x, y } = getCanvasCoordinates(event, canvasRef.current);

    const zoomFactor = 1.01;
    const mouseX = (x - panX) / scale;
    const mouseY = (y - panY) / scale;

    let newScale;
    if (event.deltaY < 0) {
      newScale = Math.min(scale * zoomFactor, 10);
    } else {
      newScale = Math.max(scale / zoomFactor, 0.1);
    }

    const newPanX = x - mouseX * newScale;
    const newPanY = y - mouseY * newScale;

    setScale(newScale);
    setPanX(newPanX);
    setPanY(newPanY);

    redraw();
  };

  const pointerRightClick = (event) => {
    event.preventDefault();
    setIsDrawing(false);
    const { x, y } = getCanvasCoordinates(event, canvasRef.current);

    const linesRemoved = [];

    const newLines = lines.filter((line) => {
      const isNear = isPointNearLine(x, y, line, 10);
      if (isNear) linesRemoved.push(line);
      return !isNear;
    });

    const newPoints = points.filter((point) => {
      const isOnRemainingLine = newLines.some(
        (line) =>
          (line.startX === point.x && line.startY === point.y) ||
          (line.endX === point.x && line.endY === point.y)
      );

      return isOnRemainingLine;
    });

    redraw(newPoints, newLines);
    setLines(newLines);
    setPoints(newPoints);
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    const handleScroll = () => {
      redraw();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [scale, lines, points, panX, panY]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%" }}
      onMouseDown={pointerPressDown}
      onMouseMove={pointerMove}
      onMouseUp={releasePointer}
      onContextMenu={pointerRightClick}
      onTouchStart={pointerPressDown}
      onTouchMove={pointerMove}
      onTouchEnd={releasePointer}
    />
  );
};

export default CanvasGrid;
