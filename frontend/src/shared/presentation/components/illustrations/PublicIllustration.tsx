import type { ImgHTMLAttributes } from 'react';
import { publicAssets } from './publicAssets';
export function PublicIllustration({ src, sizes = '(max-width: 639px) 180px, 320px', fetchPriority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string; fetchPriority?: string }) {
  const asset = publicAssets[src];
  const priorityAttr = fetchPriority ? { fetchpriority: fetchPriority } : {};
  return <img width={asset?.width} height={asset?.height} {...props} {...priorityAttr} src={asset?.src ?? src} srcSet={asset?.srcSet} sizes={asset ? sizes : undefined}/>;
}
