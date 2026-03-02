export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculate luminance of a color
 */
export const getLuminance = (r, g, b) => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (rgb1, rgb2) => {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Determine if text should be black or white based on background color
 */
export const getContrastTextColor = (bgColor) => {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return "#000000";

  const whiteRgb = { r: 255, g: 255, b: 255 };
  const blackRgb = { r: 0, g: 0, b: 0 };

  const whiteContrast = getContrastRatio(rgb, whiteRgb);
  const blackContrast = getContrastRatio(rgb, blackRgb);

  // WCAG AA standard requires at least 4.5:1 contrast ratio
  return whiteContrast > blackContrast ? "#FFFFFF" : "#000000";
};

/**
 * Lighten or darken a color
 */
export const adjustColor = (color, amount) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const adjust = (val) => {
    const newVal = val + amount;
    return Math.max(0, Math.min(255, newVal));
  };

  const r = adjust(rgb.r).toString(16).padStart(2, "0");
  const g = adjust(rgb.g).toString(16).padStart(2, "0");
  const b = adjust(rgb.b).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
};

/**
 * Generate color palette from base color
 */
export const generateColorPalette = (baseColor) => {
  return {
    primary: baseColor,
    light: adjustColor(baseColor, 60),
    lighter: adjustColor(baseColor, 120),
    dark: adjustColor(baseColor, -60),
    darker: adjustColor(baseColor, -120),
    text: getContrastTextColor(baseColor),
  };
};
