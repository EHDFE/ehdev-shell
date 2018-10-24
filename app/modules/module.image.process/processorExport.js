import { Map, List } from 'immutable';

import Pngquant, {
  defaultConfig as PngquantConfig,
} from './processors/Pngquant';
import Gifsicle, {
  defaultConfig as GifsicleConfig,
} from './processors/Gifsicle';
import Mozjpeg, { defaultConfig as MozjpegConfig } from './processors/Mozjpeg';
import Webp, { defaultConfig as WebpConfig } from './processors/Webp';
import Guetzli, { defaultConfig as GuetzliConfig } from './processors/Guetzli';
import Zopfli, { defaultConfig as ZopfliConfig } from './processors/Zopfli';
import Svgo, { defaultConfig as SvgoConfig } from './processors/Svgo';
import FFmpeg, { defaultConfig as FFmpegConfig } from './processors/FFmpeg';
// import Upng, { defaultConfig as UpngConfig } from './processors/Upng';

const PROCESSOR_MAP = Map({
  'image/gif': List(['Gifsicle', 'FFmpeg']),
  'image/jpeg': List(['Mozjpeg', 'Guetzli', 'Webp']),
  'image/png': List(['Pngquant', 'Zopfli', 'Guetzli', 'Webp']),
  'image/webp': List(['Webp']),
  'image/svg+xml': List(['Svgo']),
  'video/*': List(['FFmpeg']),
});
const PROCESSOR_COMPONENT_MAP = {
  Pngquant,
  Gifsicle,
  Mozjpeg,
  Webp,
  Guetzli,
  Zopfli,
  Svgo,
  FFmpeg,
};
const PROESSOR_DEFAULT_CONFIG = {
  Pngquant: PngquantConfig,
  Gifsicle: GifsicleConfig,
  Mozjpeg: MozjpegConfig,
  Webp: WebpConfig,
  Guetzli: GuetzliConfig,
  Zopfli: ZopfliConfig,
  Svgo: SvgoConfig,
  FFmpeg: FFmpegConfig,
};

export const getProcessorComponent = processor =>
  PROCESSOR_COMPONENT_MAP[processor];

export const getAvailableProcessors = mimeType => {
  if (PROCESSOR_MAP.has(mimeType)) return PROCESSOR_MAP.get(mimeType, List());
  const fuzzyMimeType = mimeType.replace(/\/(.*)$/, '/*');
  return PROCESSOR_MAP.get(fuzzyMimeType, List());
};

export const getDefaultProcessorConfig = processor =>
  PROESSOR_DEFAULT_CONFIG[processor];
