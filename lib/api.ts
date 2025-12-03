export interface UserProductsResponse {
  email: string;
  purchasedProducts: string[];
  lockedProducts: string[];
}

export async function getUserProducts(email: string): Promise<UserProductsResponse | null> {
  try {
    const response = await fetch(`/api/user/products?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      console.error('Failed to fetch user products:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user products:', error);
    return null;
  }
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch {
    return false;
  }
}
