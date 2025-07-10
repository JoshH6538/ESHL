import { allBranches } from "./api.js";

const BRANCH_CACHE_KEY = "branchCache";
const BRANCH_CACHE_EXPIRY_KEY = "branchCacheExpiry";
const EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

export async function getBranches() {
  const cached = localStorage.getItem(BRANCH_CACHE_KEY);
  const expiry = localStorage.getItem(BRANCH_CACHE_EXPIRY_KEY);

  // Check cache validity
  if (cached && expiry && Date.now() < parseInt(expiry, 10)) {
    console.log("Using cached branch data.");
    try {
      return JSON.parse(cached);
    } catch {
      console.warn("Branch cache parse failed. Clearing corrupted cache.");
      clearBranchCache();
    }
  } else if (cached) {
    console.log("Branch cache expired.");
    clearBranchCache();
  }

  // Fetch fresh data
  // console.log("Fetching branches...");
  const branches = await allBranches();
  if (!branches || branches.length === 0) {
    console.warn("No branches found or API call failed.");
    return [];
  }
  console.log("Branches fetched:", branches);

  // Cache with expiration
  localStorage.setItem(BRANCH_CACHE_KEY, JSON.stringify(branches));
  localStorage.setItem(
    BRANCH_CACHE_EXPIRY_KEY,
    (Date.now() + EXPIRATION_TIME).toString()
  );

  return branches;
}

export function clearBranchCache() {
  localStorage.removeItem(BRANCH_CACHE_KEY);
  localStorage.removeItem(BRANCH_CACHE_EXPIRY_KEY);
}

export function arrayToMap(array, keyField) {
  if (!Array.isArray(array)) {
    console.error("Expected array, got:", array);
    return new Map();
  }
  const map = new Map();

  for (const item of array) {
    const key = item[keyField];
    if (key !== undefined && key !== null) {
      map.set(key, item);
    }
  }

  return map;
}
