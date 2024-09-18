function isValueValid(value, min, max) {
    return value >= min && value <= max;
}

function showError(message) {
    document.getElementById('error-message').innerText = message;
}

function clearError() {
    document.getElementById('error-message').innerText = '';
}

// CMYK to RGB conversion
function cmykToRgb(c, m, y, k) {
    let r = 255 * (1 - c / 100) * (1 - k / 100);
    let g = 255 * (1 - m / 100) * (1 - k / 100);
    let b = 255 * (1 - y / 100) * (1 - k / 100);
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

// RGB to CMYK conversion
function rgbToCmyk(r, g, b) {
    let rC = r / 255, gC = g / 255, bC = b / 255;
    let k = 1 - Math.max(rC, gC, bC);
    let c = (1 - rC - k) / (1 - k);
    let m = (1 - gC - k) / (1 - k);
    let y = (1 - bC - k) / (1 - k);
    return {
        c: isNaN(c) ? 0 : Math.round(c * 100),
        m: isNaN(m) ? 0 : Math.round(m * 100),
        y: isNaN(y) ? 0 : Math.round(y * 100),
        k: Math.round(k * 100)
    };
}

// RGB to HLS conversion
function rgbToHls(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, l = (max + min) / 2;
    let s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);

    if (max === min) {
        h = 0;
    } else if (max === r) {
        h = (g - b) / (max - min) + (g < b ? 6 : 0);
    } else if (max === g) {
        h = (b - r) / (max - min) + 2;
    } else {
        h = (r - g) / (max - min) + 4;
    }

    return { h: Math.round(h * 60), l: Math.round(l * 100), s: Math.round(s * 100) };
}

// HLS to RGB conversion
function hlsToRgb(h, l, s) {
    h /= 360;
    l /= 100;
    s /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // Achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 3) return q;
            if (t < 1 / 2) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// RGB to XYZ conversion
function rgbToXyz(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
    let yNorm = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;

    return { x: x.toFixed(2), y: yNorm.toFixed(2), z: z.toFixed(2) };
}

// XYZ to RGB conversion
function xyzToRgb(x, y, z) {
    x /= 100;
    y /= 100;
    z /= 100;

    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// Update background color
function updateBackgroundColor(r, g, b) {
    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

// Handle CMYK input and update other models
function handleCmykInput() {
    let c = parseFloat(document.getElementById('c').value);
    let m = parseFloat(document.getElementById('m').value);
    let y = parseFloat(document.getElementById('y').value);
    let k = parseFloat(document.getElementById('k').value);

    if (isValueValid(c, 0, 100) && isValueValid(m, 0, 100) && isValueValid(y, 0, 100) && isValueValid(k, 0, 100)) {
        clearError();
        let rgb = cmykToRgb(c, m, y, k);
        updateBackgroundColor(rgb.r, rgb.g, rgb.b);

        // Update HLS
        let hls = rgbToHls(rgb.r, rgb.g, rgb.b);
        document.getElementById('h').value = hls.h;
        document.getElementById('l').value = hls.l;
        document.getElementById('s').value = hls.s;

        // Update XYZ
        let xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);
        document.getElementById('x').value = xyz.x;
        document.getElementById('y-xyz').value = xyz.y;
        document.getElementById('z').value = xyz.z;
    } else {
        showError("Недопустимые значения CMYK");
    }
}

// Handle HLS input and update other models
function handleHlsInput() {
    let h = parseFloat(document.getElementById('h').value);
    let l = parseFloat(document.getElementById('l').value);
    let s = parseFloat(document.getElementById('s').value);

    if (isValueValid(h, 0, 360) && isValueValid(l, 0, 100) && isValueValid(s, 0, 100)) {
        clearError();
        let rgb = hlsToRgb(h, l, s);
        updateBackgroundColor(rgb.r, rgb.g, rgb.b);

        // Update CMYK
        let cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
        document.getElementById('c').value = cmyk.c;
        document.getElementById('m').value = cmyk.m;
        document.getElementById('y').value = cmyk.y;
        document.getElementById('k').value = cmyk.k;

        // Update XYZ
        let xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);
        document.getElementById('x').value = xyz.x;
        document.getElementById('y-xyz').value = xyz.y;
        document.getElementById('z').value = xyz.z;
    } else {
        showError("Недопустимые значения HLS");
    }
}

// Handle XYZ input and update other models
function handleXyzInput() {
    let x = parseFloat(document.getElementById('x').value);
    let y = parseFloat(document.getElementById('y-xyz').value);
    let z = parseFloat(document.getElementById('z').value);

    if (isValueValid(x, 0, 100) && isValueValid(y, 0, 100) && isValueValid(z, 0, 100)) {
        clearError();
        let rgb = xyzToRgb(x, y, z);
        updateBackgroundColor(rgb.r, rgb.g, rgb.b);

        // Update CMYK
        let cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
        document.getElementById('c').value = cmyk.c;
        document.getElementById('m').value = cmyk.m;
        document.getElementById('y').value = cmyk.y;
        document.getElementById('k').value = cmyk.k;

        // Update HLS
        let hls = rgbToHls(rgb.r, rgb.g, rgb.b);
        document.getElementById('h').value = hls.h;
        document.getElementById('l').value = hls.l;
        document.getElementById('s').value = hls.s;
    } else {
        showError("Недопустимые значения XYZ");
    }
}

// Initialize color palette
function initPalette() {
    const palette = document.getElementById('palette');
    const colors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'
    ];

    colors.forEach(color => {
        const div = document.createElement('div');
        div.className = 'color-box';
        div.style.backgroundColor = color;
        div.addEventListener('click', () => {
            document.getElementById('colorPicker').value = color;
            handleColorPickerInput();
        });
        palette.appendChild(div);
    });
}

// Handle color picker input
function handleColorPickerInput() {
    let color = document.getElementById('colorPicker').value;
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    // Update RGB fields
    document.getElementById('c').value = rgbToCmyk(r, g, b).c;
    document.getElementById('m').value = rgbToCmyk(r, g, b).m;
    document.getElementById('y').value = rgbToCmyk(r, g, b).y;
    document.getElementById('k').value = rgbToCmyk(r, g, b).k;

    // Update HLS fields
    let hls = rgbToHls(r, g, b);
    document.getElementById('h').value = hls.h;
    document.getElementById('l').value = hls.l;
    document.getElementById('s').value = hls.s;

    // Update XYZ fields
    let xyz = rgbToXyz(r, g, b);
    document.getElementById('x').value = xyz.x;
    document.getElementById('y-xyz').value = xyz.y;
    document.getElementById('z').value = xyz.z;

    // Update background color
    updateBackgroundColor(r, g, b);
}

// Event listeners
document.getElementById('c').addEventListener('input', handleCmykInput);
document.getElementById('m').addEventListener('input', handleCmykInput);
document.getElementById('y').addEventListener('input', handleCmykInput);
document.getElementById('k').addEventListener('input', handleCmykInput);

document.getElementById('h').addEventListener('input', handleHlsInput);
document.getElementById('l').addEventListener('input', handleHlsInput);
document.getElementById('s').addEventListener('input', handleHlsInput);

document.getElementById('x').addEventListener('input', handleXyzInput);
document.getElementById('y-xyz').addEventListener('input', handleXyzInput);
document.getElementById('z').addEventListener('input', handleXyzInput);

document.getElementById('colorPicker').addEventListener('input', handleColorPickerInput);

// Initialize color palette
initPalette();
