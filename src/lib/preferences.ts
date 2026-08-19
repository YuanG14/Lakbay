export type LakbayPreferences = { fuelPrice: number; defaultVehicleId: string; distanceUnit: 'km' };
export const SETTINGS_KEY = 'lakbay_preferences_v1';
export const defaultPreferences: LakbayPreferences = { fuelPrice: 78, defaultVehicleId: '', distanceUnit: 'km' };

export function readPreferences(): LakbayPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
      ...defaultPreferences,
      ...saved,
      fuelPrice: Number(saved.fuelPrice) > 0 ? Number(saved.fuelPrice) : defaultPreferences.fuelPrice,
    };
  } catch {
    return defaultPreferences;
  }
}
