export interface ProductMapping {
  hotmartProductId: string;
  appProductId: string;
  name: string;
  offerCode: string;
}

export const PRODUCT_MAPPINGS: ProductMapping[] = [
  {
    name: "Gelatina Reductora",
    appProductId: "p1",
    hotmartProductId: "6694071",
    offerCode: "8pqi3d4c"
  },
  {
    name: "Desinflamación de 7 días",
    appProductId: "p2",
    hotmartProductId: "HOTMART_PRODUCT_2",
    offerCode: ""
  },
  {
    name: "Registro de Evolución",
    appProductId: "p3",
    hotmartProductId: "HOTMART_PRODUCT_3",
    offerCode: ""
  },
  {
    name: "Acelerador 14 Días",
    appProductId: "l1",
    hotmartProductId: "HOTMART_PRODUCT_L1",
    offerCode: ""
  },
  {
    name: "Quema-Grasa Mientras Duermes",
    appProductId: "l2",
    hotmartProductId: "HOTMART_PRODUCT_L2",
    offerCode: ""
  }
];

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
