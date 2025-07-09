import { allLOs } from "./retool-api.js";

const USER_CACHE_KEY = "userCache";
const USER_CACHE_EXPIRY_KEY = "userCacheExpiry";
const EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

export async function getUserData() {
  const cached = localStorage.getItem(USER_CACHE_KEY);
  const expiry = localStorage.getItem(USER_CACHE_EXPIRY_KEY);

  if (cached && expiry && Date.now() < parseInt(expiry, 10)) {
    console.log("Using cached user data.");
    try {
      return JSON.parse(cached);
    } catch {
      console.warn("User cache parse failed. Clearing corrupted cache.");
      clearUserCache();
    }
  } else if (cached) {
    console.log("User cache expired.");
    clearUserCache();
  }

  // console.log("Fetching users...");
  const users = await allLOs();
  if (!users || users.length === 0) {
    console.warn("No users found or API call failed.");
    return [];
  }
  // console.log("Users fetched:", users);

  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(users));
  localStorage.setItem(
    USER_CACHE_EXPIRY_KEY,
    (Date.now() + EXPIRATION_TIME).toString()
  );

  return users;
}

export function clearUserCache() {
  localStorage.removeItem(USER_CACHE_KEY);
  localStorage.removeItem(USER_CACHE_EXPIRY_KEY);
}
