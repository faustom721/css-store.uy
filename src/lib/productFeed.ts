import type { CollectionEntry } from 'astro:content';

type ProductEntry = CollectionEntry<'products'>;

export type BuildFeedOptions = {
	kind: 'google' | 'meta';
	/** e.g. https://css-store.uy */
	origin: string;
	channelTitle: string;
	channelLink: string;
	channelDescription: string;
};

function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		;

}

function twoDecimals(n: number): string {
	return n.toFixed(2);
}

/** Google Merchant: in_stock, out_of_stock, preorder, backorder */
function availabilityForGoogle(commerce: string): string {
	switch (commerce) {
		case 'in stock':
			return 'in_stock';
		case 'out of stock':
			return 'out_of_stock';
		case 'available for order':
		default:
			return 'in_stock';
	}
}

/** Meta: spaces in the value, per Commerce Manager examples */
function availabilityForMeta(commerce: string): string {
	return commerce;
}

/**
 * g: condition value for feeds (lowercase, Google / Meta)
 */
function conditionValue(_c: 'new' | 'refurbished' | 'used'): string {
	return 'new';
}

/**
 * @param images resolved absolute URLs
 */
function buildItem(
	product: ProductEntry,
	origin: string,
	images: string[],
	opts: BuildFeedOptions,
	fallbackGpc: string,
	fallbackBrand: string,
) {
	const d = product.data;
	const slug = d.slug;
	const link = `${origin}/shop/${encodeURIComponent(slug)}/`;
	const desc = d.shortDescription || (product.body ? plainFromMarkdownish(product.body) : d.title);
	const gpc = d.googleProductCategory ?? fallbackGpc;
	const brand = d.brand || fallbackBrand;
	const primary = images[0] ?? new URL('/android-chrome-512x512.png', origin).toString();
	const rest = images.slice(1, 9);
	const price = `${twoDecimals(d.price)} ${'UYU'}`;
	const sale = d.salePrice != null ? `${twoDecimals(d.salePrice)} UYU` : null;
	const gAvailText =
		opts.kind === 'google' ? availabilityForGoogle(d.availability) : availabilityForMeta(d.availability);

	return `
    <item>
      <title>${escapeXml(d.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(desc)}</description>
      <g:id>${escapeXml(slug)}</g:id>
      <g:title>${escapeXml(d.title)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:condition>${conditionValue(d.condition as 'new' | 'refurbished' | 'used')}</g:condition>
      <g:availability>${escapeXml(gAvailText)}</g:availability>
      <g:price>${escapeXml(price)}</g:price>
      ${sale ? `      <g:sale_price>${escapeXml(sale)}</g:sale_price>\n` : ''}      <g:image_link>${escapeXml(primary)}</g:image_link>
      ${rest.map((u) => `      <g:additional_image_link>${escapeXml(u)}</g:additional_image_link>\n`).join('')}      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>${escapeXml(gpc)}</g:google_product_category>
      <g:product_type>${escapeXml(d.category)}</g:product_type>
      <g:identifier_exists>false</g:identifier_exists>
    </item>
`;
}

function plainFromMarkdownish(s: string): string {
	/* one line, strip simple markdown; feeds want plain text */
	return s
		.replace(/[#*_`>\[\]]/g, '')
		.split(/\n/)
		.map((l) => l.trim())
		.join(' ')
		.slice(0, 2000);
}

/**
 * @param getImageUrl — async resolver from Astro image (ImageMetadata) to absolute string URL
 */
export async function buildRssProductFeed(
	productEntries: ProductEntry[],
	getImageUrl: (meta: { src: string; width: number; height: number; format: string } | null) => Promise<string>,
	opts: BuildFeedOptions,
	extra: { fallbackGpc: string; fallbackBrand: string },
): Promise<string> {
	const { origin, channelTitle, channelLink, channelDescription } = opts;
	const { fallbackGpc, fallbackBrand } = extra;
	const lastBuild = new Date().toUTCString();
	const items: string[] = [];
	for (const p of productEntries) {
		const srcs: string[] = [];
		for (const im of p.data.images) {
			/* ImageMetadata in collection */
			const m = im as { src: string; width: number; height: number; format: string } | null;
			const u = m ? await getImageUrl(m) : null;
			if (u) srcs.push(u);
		}
		if (srcs.length === 0) {
			srcs.push(new URL('/android-chrome-512x512.png', origin).toString());
		}
		items.push(buildItem(p, origin, srcs, opts, fallbackGpc, fallbackBrand).trimEnd());
	}
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(channelDescription)}</description>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>
`;
}
