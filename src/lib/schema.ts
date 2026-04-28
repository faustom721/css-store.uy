/** Google Merchant–style string from frontmatter (spaces) */
export function schemaAvailability(availability: string): string {
	switch (availability) {
		case 'in stock':
			return 'https://schema.org/InStock';
		case 'out of stock':
			return 'https://schema.org/OutOfStock';
		case 'available for order':
		default:
			return 'https://schema.org/PreOrder';
	}
}

export const priceValidUntilEoy = (): string => {
	const y = new Date().getUTCFullYear();
	return `${y}-12-31`;
};
