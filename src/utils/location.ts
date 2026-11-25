import * as Location from 'expo-location';

export type Coords = { lat: number; lng: number };

/** Request foreground permission and return current coords, or null if unavailable. */
export async function getCurrentCoords(): Promise<Coords | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}
