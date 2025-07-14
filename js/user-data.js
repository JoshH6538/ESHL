import { allLOs, findUserReviews } from "./api.js";

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

export async function getUserReviews(userId) {
  const REVIEWS_CACHE_KEY = `${userId}_reviewsCache`;
  const REVIEWS_CACHE_EXPIRY_KEY = `${userId}_reviewsCacheExpiry`;
  const REVIEW_EXPIRATION_TIME = 60 * 5 * 1000; // 5 minutes
  const cached = localStorage.getItem(REVIEWS_CACHE_KEY);
  const expiry = localStorage.getItem(REVIEWS_CACHE_EXPIRY_KEY);

  if (cached && expiry && Date.now() < parseInt(expiry, 10)) {
    console.log("Using cached user reviews.");
    try {
      return JSON.parse(cached);
    } catch {
      console.warn(
        "User reviews cache parse failed. Clearing corrupted cache."
      );
      clearUserReviewsCache();
    }
  } else if (cached) {
    console.log("User reviews cache expired.");
    clearUserReviewsCache();
  }

  // console.log("Fetching user reviews...");
  const reviews = await findUserReviews(userId);
  localStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(reviews));
  localStorage.setItem(
    REVIEWS_CACHE_EXPIRY_KEY,
    (Date.now() + REVIEW_EXPIRATION_TIME).toString()
  );
  return reviews;
}

export function clearUserReviewsCache(userId) {
  const REVIEWS_CACHE_KEY = `${userId}_reviewsCache`;
  const REVIEWS_CACHE_EXPIRY_KEY = `${userId}_reviewsCacheExpiry`;
  localStorage.removeItem(REVIEWS_CACHE_KEY);
  localStorage.removeItem(REVIEWS_CACHE_EXPIRY_KEY);
}
