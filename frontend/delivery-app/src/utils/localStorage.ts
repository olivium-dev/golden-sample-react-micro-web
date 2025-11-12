export interface Parcelet {
  id: number;
  order_id: number;
  customer_name: string;
  customer_email: string;
  product_name: string;
  quantity: number;
  shipping_address: string;
  tracking_number: string;
  status: 'pending' | 'shipped' | 'delivered';
  notes?: string;
  created_at: string;
  updated_at: string;
}


const PARCELETS_STORAGE_KEY = 'delivery_app_parcelets';
const LAST_UPDATED_KEY = 'delivery_app_last_updated';

/**
 * Save parcelets data to local storage
 * @param parcelets Array of parcelet objects
 */
export const saveParceletsToLocalStorage = (parcelets: Parcelet[]): void => {
  try {
    localStorage.setItem(PARCELETS_STORAGE_KEY, JSON.stringify(parcelets));
    localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error saving parcelets to local storage:', error);
  }
};

/**
 * Get parcelets data from local storage
 * @returns Array of parcelet objects or null if not found
 */
export const getParceletsFromLocalStorage = (): Parcelet[] | null => {
  try {
    const parceletsData = localStorage.getItem(PARCELETS_STORAGE_KEY);
    if (!parceletsData) return null;
    return JSON.parse(parceletsData);
  } catch (error) {
    console.error('Error retrieving parcelets from local storage:', error);
    return null;
  }
};

/**
 * Get a single parcelet by ID from local storage
 * @param id Parcelet ID
 * @returns Parcelet object or null if not found
 */
export const getParceletByIdFromLocalStorage = (id: number): Parcelet | null => {
  try {
    const parcelets = getParceletsFromLocalStorage();
    if (!parcelets) return null;
    return parcelets.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error retrieving parcelet from local storage:', error);
    return null;
  }
};

/**
 * Update a single parcelet in local storage
 * @param updatedParcelet Updated parcelet object
 * @returns true if successful, false otherwise
 */
export const updateParceletInLocalStorage = (updatedParcelet: Parcelet): boolean => {
  try {
    const parcelets = getParceletsFromLocalStorage();
    if (!parcelets) return false;
    
    const updatedParcelets = parcelets.map(p => 
      p.id === updatedParcelet.id ? updatedParcelet : p
    );
    
    saveParceletsToLocalStorage(updatedParcelets);
    return true;
  } catch (error) {
    console.error('Error updating parcelet in local storage:', error);
    return false;
  }
};

/**
 * Clear all parcelets data from local storage
 */
export const clearParceletsFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(PARCELETS_STORAGE_KEY);
    localStorage.removeItem(LAST_UPDATED_KEY);
  } catch (error) {
    console.error('Error clearing parcelets from local storage:', error);
  }
};

/**
 * Get the last updated timestamp
 * @returns ISO string date or null if not found
 */
export const getLastUpdatedTimestamp = (): string | null => {
  try {
    return localStorage.getItem(LAST_UPDATED_KEY);
  } catch (error) {
    console.error('Error retrieving last updated timestamp:', error);
    return null;
  }
};

