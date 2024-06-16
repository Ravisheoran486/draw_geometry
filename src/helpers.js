export const getCanvasCoordinates = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    
    let x, y;
    if (event.touches && event.touches[0]) {
      const touch = event.touches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }
  
    return { x, y };
  };
  
  export const drawLine = (
    context,
    startX,
    startY,
    endX,
    endY,
    length,
    scale
  ) => {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
  
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
  
    let angle = Math.atan2(endY - startY, endX - startX);

    context.save();
  
    context.translate(midX, midY);

    context.rotate(angle);
  
    context.font = `400 ${12 * scale}px Epilogue`;
    context.fillStyle = "black";
    context.fillText(Math.round(length) + "cm", -5 * scale, 15 * scale);
  
    context.restore();
  };
  
  export const drawPoint = (context, x, y, name, direction, scale) => {
    context.beginPath();
    context.arc(x, y, 2 * scale, 0, Math.PI * 2);
    context.fillStyle = "black";
    context.fill();
    context.font = `400 ${10 * scale}px Epilogue`;
    context.fillStyle = "black";
  
    context.fillText(
      name,
      x + direction[0] * 10 * scale,
      y + direction[1] * 10 * scale
    ); // Adjust position for name
  };
  
  export const findNearestPoint = (points, x, y, snapThreshold, scale) => {
    const threshold = snapThreshold / scale;
    let nearestPoint = null;
    let minDistance = threshold;
  
    points.forEach((point) => {
      const distance = Math.hypot(x - point.x, y - point.y);
      if (distance < minDistance) {
        nearestPoint = point;
        minDistance = distance;
      }
    });
  
    return nearestPoint;
  };
  
  export const generatePointName = (index) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let name = "";
    while (index >= 0) {
      name = letters[index % 26] + name;
      index = Math.floor(index / 26) - 1;
    }
    return name;
  };
  
  export const drawGrid = (
    dotSpacing,
    width,
    height,
    context,
    dotRadius,
    panX,
    panY,
    scale
  ) => {
    context.clearRect(0, 0, width, height);
    const spacing = dotSpacing * scale;
    for (let x = -panX % spacing; x < width; x += spacing) {
      for (let y = -panY % spacing; y < height; y += spacing) {
        context.beginPath();
        context.arc(x, y, dotRadius * scale, 0, Math.PI * 2);
        context.fillStyle = "black";
        context.fill();
      }
    }
  };
  
  export const drawAngle = (context, line1, line2, scale, panX, panY) => {
    const radius = 20 * scale;
    let commonPoint, restPoints;
  
    if (line1.startX === line2.startX && line1.startY === line2.startY) {
      commonPoint = {
        x: line1.startX,
        y: line1.startY,
      };
      restPoints = {
        1: {
          x: line1.endX,
          y: line1.endY,
        },
        2: {
          x: line2.endX,
          y: line2.endY,
        },
      };
    } else if (line1.startX === line2.endX && line1.startY === line2.endY) {
      commonPoint = {
        x: line1.startX,
        y: line1.startY,
      };
      restPoints = {
        1: {
          x: line1.endX,
          y: line1.endY,
        },
        2: {
          x: line2.startX,
          y: line2.startY,
        },
      };
    } else if (line1.endX === line2.startX && line1.endY === line2.startY) {
      commonPoint = {
        x: line1.endX,
        y: line1.endY,
      };
      restPoints = {
        1: {
          x: line1.startX,
          y: line1.startY,
        },
        2: {
          x: line2.endX,
          y: line2.endY,
        },
      };
    } else if (line1.endX === line2.endX && line1.endY === line2.endY) {
      commonPoint = {
        x: line1.endX,
        y: line1.endY,
      };
      restPoints = {
        1: {
          x: line1.startX,
          y: line1.startY,
        },
        2: {
          x: line2.startX,
          y: line2.startY,
        },
      };
    }
  
    const pointOne = restPoints[1];
    const pointTwo = restPoints[2];
  
    const dx1 = pointOne.x - commonPoint.x;
    const dy1 = pointOne.y - commonPoint.y;
    const dx2 = pointTwo.x - commonPoint.x;
    const dy2 = pointTwo.y - commonPoint.y;
  
    let endAngle = Math.atan2(dy1, dx1);
    let startAngle = Math.atan2(dy2, dx2);
  
    if (Math.abs(startAngle) > Math.abs(endAngle)) {
      const temp = endAngle;
      endAngle = startAngle;
      startAngle = temp;
    }
  
    let angleFinal =
      parseInt(((endAngle - startAngle) * 180) / Math.PI + 360) % 360;
  
    context.save();
    context.beginPath();
    context.moveTo(commonPoint.x * scale + panX, commonPoint.y * scale + panY);
  
    if (angleFinal < 180)
      context.arc(
        commonPoint.x * scale + panX,
        commonPoint.y * scale + panY,
        radius,
        startAngle,
        endAngle
      );
    else
      context.arc(
        commonPoint.x * scale + panX,
        commonPoint.y * scale + panY,
        radius,
        startAngle,
        endAngle,
        -1
      );
  
    context.globalAlpha = 1;
    context.stroke();
    context.restore();
  
    const midAngle = (startAngle + endAngle) / 2;
    const textX = commonPoint.x * scale + panX + radius * Math.cos(midAngle);
    const textY = commonPoint.y * scale + panY + radius * Math.sin(midAngle);
    angleFinal = angleFinal > 180 ? 360 - angleFinal : angleFinal;
    const text = angleFinal.toFixed(1) + "°";
    context.font = `400 ${10 * scale}px Epilogue`;
    const textWidth = context.measureText(text).width;
    const textHeight = 10 * scale;
    context.save();
    context.translate(textX + 10 * scale, textY + 10 * scale);
    context.rotate(midAngle + Math.PI / 2);
    context.fillText(text, -textWidth / 2, textHeight / 2);
    context.restore();
  };
  
  const drawPoints = (context, points, scale, panX, panY) => {
    points.forEach((point) => {
      drawPoint(
        context,
        point.x * scale + panX,
        point.y * scale + panY,
        point.name,
        point.direction,
        scale
      );
    });
  };
  
  const drawLines = (context, lines, scale, panX, panY) => {
    lines.forEach((line) => {
      drawLine(
        context,
        line.startX * scale + panX,
        line.startY * scale + panY,
        line.endX * scale + panX,
        line.endY * scale + panY,
        line.length,
        scale
      );
    });
  };
  
  export const redrawCanvas = (
    canvas,
    points,
    lines,
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
  ) => {
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
  
    drawGrid(dotSpacing, width, height, context, dotRadius, panX, panY, scale);
    drawPoints(context, points, scale, panX, panY);
    drawLines(context, lines, scale, panX, panY);
  
    if (isDrawing) {
      const lengthInUnits = (
        Math.hypot(currentX - startX, currentY - startY) /
        (dotSpacing * 4)
      ).toFixed(1);
  
      drawLine(
        context,
        startX * scale + panX,
        startY * scale + panY,
        currentX * scale + panX,
        currentY * scale + panY,
        lengthInUnits,
        scale
      );
    }
  
    // Draw angles
    points.forEach((point) => {
      const connectedLines = lines.filter(
        (line) =>
          line.startX !== line.endX &&
          ((line.startX === point.x && line.startY === point.y) ||
            (line.endX === point.x && line.endY === point.y))
      );
      if (connectedLines.length >= 2) {
        drawAngle(
          context,
          connectedLines[0],
          connectedLines[1],
          scale,
          panX,
          panY
        );
      }
    });
  };
  
  export const isPointNearLine = (x, y, line, tolerance = 5) => {
    const { startX: x1, startY: y1, endX: x2, endY: y2 } = line;
  
    // Calculate the distance from the point to the line segment
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
  
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;
  
    let xx, yy;
  
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
  
    const dx = x - xx;
    const dy = y - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);
  
    return distance < tolerance;
  };
  