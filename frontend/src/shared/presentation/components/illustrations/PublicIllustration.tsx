import type { ImgHTMLAttributes } from 'react';
import { publicAssets } from './publicAssets';
export function PublicIllustration({ src, sizes = '(max-width: 639px) 180px, 320px', ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const asset = publicAssets[src];
  return <img width={asset?.width} height={asset?.height} {...props} src={asset?.src ?? src} srcSet={asset?.srcSet} sizes={asset ? sizes : undefined}/>;
}
