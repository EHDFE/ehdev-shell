import { Map, List } from 'immutable';

import Pngquant, { defaultConfig as PngquantConfig } from './processors/Pngquant';
import Gifsicle, { defaultConfig as GifsicleConfig } from './processors/Gifsicle';
import Mozjpeg, { defaultConfig as MozjpegConfig } from './processors/Mozjpeg';
import Webp, { defaultConfig as WebpConfig } from './processors/Webp';
import Guetzli, { defaultConfig as GuetzliConfig } from './processors/Guetzli';
import Zopfli, { defaultConfig as ZopfliConfig } from './processors/Zopfli';
import Svgo, { defaultConfig as SvgoConfig } from './processors/Svgo';
// import Upng, { defaultConfig as UpngConfig } from './processors/Upng';

const PROCESSOR_MAP = Map({
  'image/gif': List(['Gifsicle']),
  'image/jpeg': List(['Mozjpeg', 'Guetzli', 'Webp']),
  'image/png': List(['Pngquant', 'Zopfli', 'Guetzli', 'Webp']),
  'image/webp': List(['Webp']),
  'image/svg+xml': List(['Svgo']),
});
const PROCESSOR_COMPONENT_MAP = {
  Pngquant,
  Gifsicle,
  Mozjpeg,
  Webp,
  Guetzli,
  Zopfli,
  Svgo,
};
const PROESSOR_DEFAULT_CONFIG = {
  Pngquant: PngquantConfig,
  Gifsicle: GifsicleConfig,
  Mozjpeg: MozjpegConfig,
  Webp: WebpConfig,
  Guetzli: GuetzliConfig,
  Zopfli: ZopfliConfig,
  Svgo: SvgoConfig,
};

export const getProcessorComponent = processor => PROCESSOR_COMPONENT_MAP[processor];

export const getAvailableProcessors = mimeType => PROCESSOR_MAP.get(mimeType, List());

export const getDefaultProcessorConfig = processor => PROESSOR_DEFAULT_CONFIG[processor];
