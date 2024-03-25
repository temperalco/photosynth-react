import React, { CSSProperties, FunctionComponent, useEffect, useRef, useState } from "react";

export type FormatType = "avif" | "gif" | "jpeg" | "png" | "tiff" | "webp";

export interface PhotoSynthProps {
  adaptiveHistogram?: number
  blur?: number
  brightness?: number
  bypass?: boolean
  cacheBust?: boolean | string
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

  // cssStyle is passed to the underlying <div>
  cssStyle?: CSSProperties
};

export const PhotoSynth: FunctionComponent<PhotoSynthProps> = (props: PhotoSynthProps) => {
  const { cssStyle, sourceUrl } = props;
  const [style, setStyle] = useState<CSSProperties>({
    height: "100%",
    width: "100%",
  });
  const ref = useRef<HTMLDivElement>(null);
  const [offsetWidth, setOffsetWidth] = useState(0);

  useEffect(() => {
    if (offsetWidth) return; // Do not recompute image since it's already in memory
    if (ref?.current?.offsetWidth) {
      setOffsetWidth(ref.current.offsetWidth);
    }
  }, [ref?.current?.offsetWidth]);

  useEffect(() => {
    if (!offsetWidth) return;
    const { url, error } = generateUrl({ ...props, offsetWidth });
    if (error) {
      console.log("PhotoSynth error processing image. Falling back to source URL.");
    }
    setStyle({
      backgroundImage: `url(${url ?? sourceUrl})`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "contain",
      height: "100%",
      width: "100%",
      ...cssStyle
    });
  }, [offsetWidth, props]);

  return ( <div ref={ref} style={style} /> );
}

interface GenerateUrlResult {
  url?: string
  error?: string
};

interface GenerateUrlProps extends PhotoSynthProps {
  offsetWidth?: number
}

export function generateUrl(args: GenerateUrlProps): GenerateUrlResult {
  const {
    REACT_APP_PHOTOSYNTH_KEY,
    REACT_APP_PHOTOSYNTH_URL = "https://ps.temperal.co/ps",
  }  = process.env ?? {};
  const {
    adaptiveHistogram, blur, brightness, bypass, cacheBust, cropBottomPercent, cropLeftPercent, 
    cropRightPercent, cropTopPercent, format, gamma, greyscale, height, hue, lightness, 
    normalizeLower, normalizeUpper, psKey, saturation, sharpen, sourceUrl, width,
    offsetWidth,
  } = args;

  // Return original source URL
  if (bypass) {
    const url = processCacheBust(sourceUrl, cacheBust);
    return { url };
  }

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

  // Prioritize width over height if both are provided to maintain aspect ratio.
  let _width = width;
  let _height = height;
  if (_width && _height) {
    _height = undefined;
  }
  else if (!_width && !_height) {
    _width = offsetWidth;
  }
  if (_width) {
    _width = roundMultiple128(_width);
  }
  else if (_height) {
    _height = roundMultiple128(_height);
  }

  let url = `${REACT_APP_PHOTOSYNTH_URL}/u=${sourceUrl},k=${key}`;
  if (validateValue({ max: 5000, min: 1, value: _width })) { url += `,w=${_width}` }
  if (validateValue({ max: 5000, min: 1, value: _height })) { url += `,h=${_height}` }
  if (validateValue({ max: 100, min: 0, value: adaptiveHistogram })) { url += `,ah=${adaptiveHistogram}` }
  if (validateValue({ max: 20, min: 0.2, type: "float", value: blur })) { url += `,b=${blur}` }
  if (validateValue({ max: 20, min: 0, type: "float", value: brightness })) { url += `,br=${brightness}` }
  if (validateValue({ max: 99, min: 1, value: cropLeftPercent }) ||
      validateValue({ max: 99, min: 1, value: cropTopPercent }) ||
      validateValue({ max: 99, min: 1, value: cropRightPercent }) ||
      validateValue({ max: 99, min: 1, value: cropBottomPercent }))
  {
    url += `,c=${cropLeftPercent ?? 0}_${cropTopPercent ?? 0}_${cropRightPercent ?? 0}_${cropBottomPercent ?? 0}`;
  }
  if (validateValue({ max: 3, min: 1, type: "float", value: gamma })) { url += `,ga=${gamma}` }
  if (validateValue({ max: 180, min: 1, type: "float", value: hue })) { url += `,hu=${hue}` }
  if (validateValue({ max: 200, min: 0, type: "float", value: lightness })) { url += `,l=${lightness}` }
  if (validateValue({ max: 99, min: 1, value: normalizeLower }) &&
      validateValue({ max: 99, min: 1, value: normalizeUpper }) &&
      (normalizeUpper ?? 0) > (normalizeLower ?? 0))
  {
    url += `,n=${normalizeLower}_${normalizeUpper}`
  }
  if (validateValue({ max: 20, min: 0, type: "float", value: saturation })) { url += `,s=${saturation}` }
  if (validateValue({ max: 10, min: 0.1, type: "float", value: sharpen })) { url += `,sh=${sharpen}` }
  if (greyscale) { url += `,gr=${greyscale}` }
  if (format) { url += `,o=${format}` }
  url = processCacheBust(url, cacheBust)

  return { url };
}

//---------------------------------------------------------
function processCacheBust(url: string, cacheBust: boolean | string | undefined) {
  if (cacheBust === true) {
    // Appending the query param none=${cacheBustVal} busts the browser cache
    return `${url}?none=${Date.now()}`;
  }
  else if (cacheBust) { // string is truthy
    return `${url}?none=${cacheBust}`;
  }
  return url;
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

//---------------------------------------------------------
// Round up to the closest multiple of 128. The minimum value is 64.
export function roundMultiple128(val: number) {
  if (val > 64) {
    return Math.ceil(val/128.0) * 128;
  }
  return 64;
}
