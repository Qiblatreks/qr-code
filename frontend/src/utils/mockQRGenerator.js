// Mock QR Code Generator for frontend-only implementation
// This will be replaced with actual QR generation logic later

export const generateMockQRCode = async (qrData) => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate content string based on type
  let content = '';
  switch (qrData.type) {
    case 'url':
      content = qrData.content;
      break;
    case 'text':
      content = qrData.content;
      break;
    case 'contact':
      content = `BEGIN:VCARD\nVERSION:3.0\nFN:${qrData.contactName || ''}\nTEL:${qrData.contactPhone || ''}\nEMAIL:${qrData.contactEmail || ''}\nORG:${qrData.contactOrg || ''}\nEND:VCARD`;
      break;
    case 'wifi':
      content = `WIFI:T:${qrData.wifiSecurity || 'WPA'};S:${qrData.wifiSSID || ''};P:${qrData.wifiPassword || ''};;`;
      break;
    default:
      content = qrData.content;
  }

  // Create a mock QR code pattern (simplified grid representation)
  const size = qrData.size || 300;
  const moduleSize = size / 25; // 25x25 grid for simplicity
  const modules = generateMockPattern(content);

  // Generate SVG with customizations
  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add background pattern if specified
  if (qrData.pattern.backgroundPattern !== 'none') {
    svg += generateBackgroundPattern(qrData.pattern.backgroundPattern, size, qrData.colors.background);
  }
  
  // Background
  svg += `<rect width="${size}" height="${size}" fill="${qrData.colors.background}"/>`;
  
  // Generate QR modules
  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 25; col++) {
      if (modules[row][col]) {
        const x = col * moduleSize;
        const y = row * moduleSize;
        
        // Check if this is an eye pattern (corners)
        const isEye = (row < 7 && col < 7) || (row < 7 && col >= 18) || (row >= 18 && col < 7);
        const color = isEye ? qrData.colors.eyeColor : qrData.colors.foreground;
        
        svg += generateModule(x, y, moduleSize, qrData.pattern.moduleShape, color, isEye ? qrData.pattern.eyePattern : qrData.pattern.moduleShape);
      }
    }
  }
  
  // Add logo if present
  if (qrData.logo) {
    const logoSize = size * 0.2; // 20% of QR size
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    
    svg += `<rect x="${logoX - 5}" y="${logoY - 5}" width="${logoSize + 10}" height="${logoSize + 10}" fill="${qrData.colors.background}" stroke="${qrData.colors.foreground}" stroke-width="2" rx="5"/>`;
    svg += `<image x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" href="${qrData.logo}" preserveAspectRatio="xMidYMid meet"/>`;
  }
  
  svg += '</svg>';
  
  return svg;
};

const generateMockPattern = (content) => {
  // Generate a pseudo-random pattern based on content
  const pattern = [];
  let seed = 0;
  for (let i = 0; i < content.length; i++) {
    seed += content.charCodeAt(i);
  }
  
  for (let row = 0; row < 25; row++) {
    pattern[row] = [];
    for (let col = 0; col < 25; col++) {
      // Create finder patterns (eyes) in corners
      if ((row < 7 && col < 7) || (row < 7 && col >= 18) || (row >= 18 && col < 7)) {
        pattern[row][col] = generateFinderPattern(row % 7, col % 7);
      } else {
        // Generate pseudo-random pattern for data
        const random = Math.sin(seed + row * 25 + col) * 10000;
        pattern[row][col] = (random - Math.floor(random)) > 0.5;
      }
    }
  }
  
  return pattern;
};

const generateFinderPattern = (row, col) => {
  // Standard QR finder pattern
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
  ];
  
  return pattern[row] ? pattern[row][col] : 0;
};

const generateModule = (x, y, size, shape, color, isEye) => {
  switch (shape) {
    case 'circle':
      return `<circle cx="${x + size/2}" cy="${y + size/2}" r="${size/2.5}" fill="${color}"/>`;
    case 'rounded':
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}" rx="${size/4}"/>`;
    case 'diamond':
      return `<path d="M ${x + size/2} ${y} L ${x + size} ${y + size/2} L ${x + size/2} ${y + size} L ${x} ${y + size/2} Z" fill="${color}"/>`;
    case 'leaf':
      if (isEye) {
        return `<path d="M ${x} ${y + size/2} Q ${x + size/2} ${y} ${x + size} ${y + size/2} Q ${x + size/2} ${y + size} ${x} ${y + size/2}" fill="${color}"/>`;
      }
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`;
    default:
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`;
  }
};

const generateBackgroundPattern = (pattern, size, bgColor) => {
  let patternSvg = `<defs><pattern id="bg-pattern" patternUnits="userSpaceOnUse" width="20" height="20">`;
  
  switch (pattern) {
    case 'dots':
      patternSvg += `<circle cx="10" cy="10" r="2" fill="${bgColor}" opacity="0.3"/>`;
      break;
    case 'grid':
      patternSvg += `<path d="M 20 0 L 0 0 0 20" fill="none" stroke="${bgColor}" stroke-width="1" opacity="0.2"/>`;
      break;
    case 'diagonal':
      patternSvg += `<path d="M 0 20 L 20 0" stroke="${bgColor}" stroke-width="1" opacity="0.2"/>`;
      break;
    default:
      break;
  }
  
  patternSvg += `</pattern></defs>`;
  patternSvg += `<rect width="${size}" height="${size}" fill="url(#bg-pattern)"/>`;
  
  return patternSvg;
};