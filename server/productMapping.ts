import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ProductMapping {
  hotmartProductId: string;
  appProductId: string;
  name: string;
  offerCode: string;
}

function loadProductMappings(): ProductMapping[] {
  try {
    const filePath = join(__dirname, 'productIds.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return data.products.map((p: any) => ({
      hotmartProductId: p.hotmartProductId,
      appProductId: p.appProductId,
      name: p.name,
      offerCode: p.offerCode || ''
    }));
  } catch (error) {
    console.error('Error loading product mappings:', error);
    return [];
  }
}

export const PRODUCT_MAPPINGS: ProductMapping[] = loadProductMappings();

export function getAppProductId(hotmartProductId: string): string | null {
  const mapping = PRODUCT_MAPPINGS.find(m => m.hotmartProductId === hotmartProductId);
  return mapping ? mapping.appProductId : null;
}

export function getHotmartProductId(appProductId: string): string | null {
  const mapping = PRODUCT_MAPPINGS.find(m => m.appProductId === appProductId);
  return mapping ? mapping.hotmartProductId : null;
}

export function getOfferCode(appProductId: string): string | null {
  const mapping = PRODUCT_MAPPINGS.find(m => m.appProductId === appProductId);
  return mapping?.offerCode || null;
}

export function getAllAppProductIds(): string[] {
  return PRODUCT_MAPPINGS.map(m => m.appProductId);
}

export function getProductInfo(appProductId: string): ProductMapping | null {
  return PRODUCT_MAPPINGS.find(m => m.appProductId === appProductId) || null;
}

export function getAllProductsInfo(): ProductMapping[] {
  return PRODUCT_MAPPINGS;
}
