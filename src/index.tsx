import React from "react";

export type FormatType = "avif" | "gif" | "jpeg" | "png" | "tiff" | "webp";

export interface PhotoSynthProps {
  adaptiveHistogram?: number
  blur?: number
  brightness?: number
  cropBottomPercent?: number
  cropLeftPercent?: number
  cropRightPercent?: number
  cropTopPercent?: number
  format?: FormatType
  gamma?: number
  greyscale?: boolean
  height?: number
  hue?: number
  lightness?: number
  normalizeLower?: number
  normalizeUpper?: number
  psKey?: string
  saturation?: number
  sharpen?: number
  sourceUrl: string
  width?: number

  // imgProps is passed to the underlying <img>
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>
};

export function PhotoSynth(props: PhotoSynthProps) {
  const { imgProps } = props;
  const { url, error } = generateUrl(props);
  if (error) return <p>{error}</p>;

  return (
    <img
      alt="" // placeholder
      src={url}
      {...imgProps}
    />
  );
}

interface GenerateUrlResult {
  url?: string
  error?: string
};

export function generateUrl(args: PhotoSynthProps): GenerateUrlResult {
  const {
    REACT_APP_PHOTOSYNTH_KEY,
    REACT_APP_PHOTOSYNTH_URL = "https://ps.temperal.co/ps",
  }  = process.env ?? {};
  const {
    blur, brightness, adaptiveHistogram, cropBottomPercent, cropLeftPercent, cropRightPercent, cropTopPercent, 
    format, gamma, greyscale, height, hue, lightness, normalizeLower, normalizeUpper, psKey, saturation, 
    sharpen, sourceUrl, width,
  } = args;
  const key = psKey ?? REACT_APP_PHOTOSYNTH_KEY;

  if (!key) {
    return { error: "Please provide the PhotoSynth key" };
  }
  if (!isValidHttpUrl(REACT_APP_PHOTOSYNTH_URL)) {
    return { error: "Please provide a valid PhotoSynth URL" };
  }
  if (!isValidHttpUrl(sourceUrl)) {
    return { error: "Please provide a valid image URL" };
  }

  let url = `${REACT_APP_PHOTOSYNTH_URL}?u=${sourceUrl}&k=${key}`;
  if (validateValue({ max: 5000, min: 1, value: width })) { url += `&w=${width}` }
  if (validateValue({ max: 5000, min: 1, value: height })) { url += `&h=${height}` }
  if (validateValue({ max: 100, min: 0, value: adaptiveHistogram })) { url += `&ah=${adaptiveHistogram}` }
  if (validateValue({ max: 20, min: 0.2, type: "float", value: blur })) { url += `&b=${blur}` }
  if (validateValue({ max: 20, min: 0, type: "float", value: brightness })) { url += `&br=${brightness}` }
  if (validateValue({ max: 99, min: 1, value: cropLeftPercent }) ||
      validateValue({ max: 99, min: 1, value: cropTopPercent }) ||
      validateValue({ max: 99, min: 1, value: cropRightPercent }) ||
      validateValue({ max: 99, min: 1, value: cropBottomPercent }))
  {
    url += `&c=${cropLeftPercent ?? 0},${cropTopPercent ?? 0},${cropRightPercent ?? 0},${cropBottomPercent ?? 0}`;
  }
  if (validateValue({ max: 3, min: 1, type: "float", value: gamma })) { url += `&ga=${gamma}` }
  if (validateValue({ max: 180, min: 1, type: "float", value: hue })) { url += `&hu=${hue}` }
  if (validateValue({ max: 200, min: 0, type: "float", value: lightness })) { url += `&l=${lightness}` }
  if (validateValue({ max: 99, min: 1, value: normalizeLower }) &&
      validateValue({ max: 99, min: 1, value: normalizeUpper }) &&
      (normalizeUpper ?? 0) > (normalizeLower ?? 0))
  {
    url += `&n=${normalizeLower},${normalizeUpper}`
  }
  if (validateValue({ max: 20, min: 0, type: "float", value: saturation })) { url += `&s=${saturation}` }
  if (validateValue({ max: 10, min: 0.1, type: "float", value: sharpen })) { url += `&sh=${sharpen}` }
  if (greyscale) { url += `&gr=${greyscale}` }
  if (format) {url += `&o=${format}` }

  return { url };
}

//---------------------------------------------------------
export interface ValidateValueArgs {
  max?: number
  min?: number
  optional?: boolean
  type?: "float" | "int" | "string"
  value: any
}

export function validateValue(args: ValidateValueArgs) {
  const { max, min, optional = true, type = "int", value } = args;
  if (optional && !value) return false;
  switch(type) {
    case "float":
      if (typeof value !== "number") return false;
      break;
    case "int":
      if (!Number.isInteger(value)) return false;
      break;
    case "string":
      return typeof value === "string";
    default:
      return false;
  }
  if (max && (value > max)) return false;
  if (min && (value < min)) return false;
  return true;
}

//---------------------------------------------------------
export function isValidHttpUrl(s: string) {
  let url;
  try {
    url = new URL(s);
  } catch (e) { return false; }
  return /https?/.test(url.protocol);
}
