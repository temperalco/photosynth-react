# PhotoSynth Component for React

This component provides a declarative interface to the PhotoSynth service for rendering images.

## Installation

> npm i photosynth-react

## Setup

A PhotoSynth key is required and may be passed to the component as the prop `psKey` or set with the environment variable `REACT_APP_PHOTOSYNTH_KEY`. The latter is preferred to avoid passing in the psKey prop to every instance.

Sign up for a free key at https://temperal.co/

## Props

| Name     | Range   | Default | Type  | Description
| -------- | ------- | ------- | ----- | ---------- |
| adaptiveHistogram  | 0 - 100 |    | int | Adaptive histogram level of brightening
| blur  | 0.02 - 20.0 |       | float | Blur strength
| brightness  | 0.0 - 20.0 |       | float | Brightness multiplier
| bypass  |  | falsy | boolean | Load sourceUrl directly without using PhotoSynth
| cacheBust |  | falsy | boolean, string | If true, bust the cache with random query param. If string, use value as the param value.
| cropBottomPercent  | 1 - 99 |       | int | Crop bottom percentage
| cropLeftPercent  | 1 - 99 |       | int | Crop left percentage
| cropRightPercent  | 1 - 99 |       | int | Crop right percentage
| cropTopPercent  | 1 - 99 |       | int | Crop top percentage
| format  |  | webp | FormatType | "avif", "gif", "jpeg", "png", "tiff", "webp"
| gamma  | 1.0 - 3.0 |  1  | float | Gamma
| greyscale  |  | falsy | boolean | Greyscale (true/false)
| height  | 1 - 5000  |       | int | Generated image height
| hue  | 0.0 - 180.0 |       | float | Hue shift
| imgProps  |   |       | object | ImgHTMLAttributes passed to the `<img>` tag
| lightness  | 0.0 - 200.0 |       | float | Lightness addition
| normalizeLower  | 1 - 99 |       | int | Normalization lower percentile threshold
| normalizeUpper  | 1 - 99 |       | int | Normalization upper percentile threshold
| psKey  |   |       | string | PhotoSynth key (Required if REACT_APP_PHOTOSYNTH_KEY not set)
| saturation  | 0.0 - 20.0 |       | float | Saturation level
| sharpen  | 0.1 - 10.0  |       | float | Sharpening level
| sourceUrl  |   |       | string | URL of the source image (**Required**)
| width  | 1 - 5000  |       | int | Generated image width

## Example

```
import { PhotoSynth } from "photosynth-react";
...

  <PhotoSynth
    adaptiveHistogram={2}
    blur={0.02}
    brightness={1.0}
    cropBottomPercent={10}
    sourceUrl="https://some.domain/path/to/picture"
    width={256}
    imgProps={{
      alt: "Alt string",
      loading: "lazy",
      width: "100%",
    }}
  />
```

## Usage with other frameworks

The `generateUrl()` method is exposed and accepts an object with the same keys as documented above. The resulting URL may be passed as the `src` attribute of the `<img>` tag.

## Notes

If the image processing fails, the original image URL will be displayed. Please contact support at https://temperal.co with the error details.
