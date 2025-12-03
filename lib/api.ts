export interface UserProductsResponse {
  email: string;
  purchasedProducts: string[];
  lockedProducts: string[];
}

export interface UserProfile {
  email: string;
  name: string;
  avatar: string | null;
}

export interface WeightEntry {
  id: number;
  user_email: string;
  weight: number;
  recorded_at: string;
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

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    const response = await fetch(`/api/user/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
}

export async function getProtocolProgress(email: string, productId: string): Promise<number[]> {
  try {
    const response = await fetch(
      `/api/user/protocol-progress?email=${encodeURIComponent(email)}&productId=${encodeURIComponent(productId)}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.completedDays || [];
  } catch (error) {
    console.error('Error fetching protocol progress:', error);
    return [];
  }
}

export async function saveProtocolProgress(
  email: string, 
  productId: string, 
  completedDays: number[]
): Promise<boolean> {
  try {
    const response = await fetch(`/api/user/protocol-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, productId, completedDays })
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving protocol progress:', error);
    return false;
  }
}

export async function getWeightEntries(email: string): Promise<WeightEntry[]> {
  try {
    const response = await fetch(`/api/user/weight-entries?email=${encodeURIComponent(email)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.entries || [];
  } catch (error) {
    console.error('Error fetching weight entries:', error);
    return [];
  }
}

export async function addWeightEntry(email: string, weight: number): Promise<WeightEntry | null> {
  try {
    const response = await fetch(`/api/user/weight-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, weight })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.entry;
  } catch (error) {
    console.error('Error adding weight entry:', error);
    return null;
  }
}

export async function deleteWeightEntry(email: string, entryId: number): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/user/weight-entries/${entryId}?email=${encodeURIComponent(email)}`,
      { method: 'DELETE' }
    );
    return response.ok;
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    return false;
  }
}
