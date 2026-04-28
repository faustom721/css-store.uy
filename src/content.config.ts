import { file, glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const productCategory = z.enum(['Medias', 'Shorts', 'Remeras', 'Buzos', 'Accesorios']);
const productAvailability = z.enum(['in stock', 'out of stock', 'available for order']);
const productCondition = z.enum(['new', 'refurbished', 'used']);

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const productCollections = defineCollection({
	loader: glob({ base: './src/content/collections', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			slug: z.string(),
			description: z.string(),
			order: z.number().default(0),
			heroImage: image().optional(),
		}),
});

const products = defineCollection({
	loader: glob({ base: './src/content/products', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) => {
		const imageField = image();
		return z.object({
			title: z.string(),
			slug: z.string(),
			shortDescription: z.string().max(2000),
			// Decap list+image y/o rutas con "/" inicial: normalizamos a lo que acepta image()
			images: z
				.preprocess((val) => {
					if (!Array.isArray(val)) return val;
					return val.map((item) => {
						if (item == null) return item;
						if (typeof item === 'string') {
							return item.startsWith('/src/') ? item.slice(1) : item;
						}
						if (typeof item === 'object' && 'image' in (item as object)) {
							const p = String((item as { image: string }).image);
							return p.startsWith('/src/') ? p.slice(1) : p;
						}
						if (typeof item === 'object' && 'file' in (item as object)) {
							const p = String((item as { file: string }).file);
							return p.startsWith('/src/') ? p.slice(1) : p;
						}
						return item;
					});
				}, z.array(imageField).min(1).max(10)),
			mercadolibre_link: z.string().url(),
			price: z.number().nonnegative(),
			salePrice: z.number().nonnegative().optional(),
			availability: productAvailability,
			condition: productCondition.default('new'),
			brand: z.string().default('CSS Store'),
			category: productCategory,
			collection: z.string(),
			featured: z.boolean().default(false),
			pubDate: z.coerce.date(),
			googleProductCategory: z.string().optional(),
		});
	},
});

const siteSettings = defineCollection({
	loader: file('src/content/data/siteSettings.json'),
	schema: z.object({
		currency: z.string().default('UYU'),
		defaultBrand: z.string().default('CSS Store'),
		defaultCountry: z.string().default('UY'),
		defaultGoogleProductCategory: z
			.string()
			.default('Apparel & Accessories > Clothing > Underwear & Socks > Socks'),
		feedBuildTitle: z.string().optional(),
		feedBuildDescription: z.string().optional(),
	}),
});

export const collections = { blog, productCollections, products, siteSettings };
