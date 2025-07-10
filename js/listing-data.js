import { allListings } from "./api.js";

const LISTING_CACHE_KEY = "listingCache";
const LISTING_CACHE_EXPIRY_KEY = "listingCacheExpiry";

// Set expiration time in milliseconds (e.g., 1 hour = 60 * 60 * 1000)
const EXPIRATION_TIME = 60 * 60 * 1000;

export async function getListings() {
  const cached = localStorage.getItem(LISTING_CACHE_KEY);
  const expiry = localStorage.getItem(LISTING_CACHE_EXPIRY_KEY);

  // Check if cache exists and has not expired
  if (cached && expiry && Date.now() < parseInt(expiry, 10)) {
    console.log("Using cached listings.");
    try {
      return JSON.parse(cached);
    } catch {
      console.warn("Cache parse failed. Clearing corrupted cache.");
      localStorage.removeItem(LISTING_CACHE_KEY);
      localStorage.removeItem(LISTING_CACHE_EXPIRY_KEY);
    }
  } else if (cached) {
    console.log("Cache expired.");
    localStorage.removeItem(LISTING_CACHE_KEY);
    localStorage.removeItem(LISTING_CACHE_EXPIRY_KEY);
  }

  const listings = await allListings();
  if (!Array.isArray(listings) || listings.length === 0) {
    console.warn("No listings returned from API.");
    return [];
  }
  console.log("Fetched listings from API:", listings.length);

  localStorage.setItem(LISTING_CACHE_KEY, JSON.stringify(listings));
  localStorage.setItem(
    LISTING_CACHE_EXPIRY_KEY,
    (Date.now() + EXPIRATION_TIME).toString()
  );

  return listings;
}
