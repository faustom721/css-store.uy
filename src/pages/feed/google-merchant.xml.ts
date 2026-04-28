import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { buildRssProductFeed } from '../../lib/productFeed';

const SITE_FALLBACK = 'https://css-store.uy';

export const GET: APIRoute = async ({ site }) => {
	const origin = site?.origin ?? SITE_FALLBACK;
	const [products, settings] = await Promise.all([
		getCollection('products'),
		getEntry('siteSettings', 'site'),
	]);
	const d = settings?.data;
	const brand = d?.defaultBrand ?? 'CSS Store';
	const gpc = d?.defaultGoogleProductCategory ?? 'Apparel & Accessories > Clothing > Underwear & Socks > Socks';
	const title = d?.feedBuildTitle ?? 'CSS Store Uruguay';
	const desc = d?.feedBuildDescription ?? 'Productos — Google Merchant / CSS Store';

	const toUrl = async (m: ImageMetadata) => {
		const o = await getImage({ src: m, width: 1200, quality: 85, format: 'jpg' });
		return new URL(o.src, origin).toString();
	};

	const getImageUrl = (meta: { src: string; width: number; height: number; format: string } | null) => {
		if (!meta) return Promise.resolve(new URL('/android-chrome-512x512.png', origin).toString());
		return toUrl(meta as ImageMetadata);
	};

	const xml = await buildRssProductFeed(products, getImageUrl, {
		kind: 'google',
		origin,
		channelTitle: title,
		channelLink: origin,
		channelDescription: desc,
	}, { fallbackGpc: gpc, fallbackBrand: brand });

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
		},
	});
};
