import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    const v = await AsyncStorage.getItem(key);
    if (!v) return fallback;
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
};
