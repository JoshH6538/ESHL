const debug = false;

const BASE_URL = debug
  ? "http://localhost:3000/api/realtors"
  : "https://v3tnqbn900.execute-api.us-east-1.amazonaws.com";

async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      console.log(`Attempt ${attempt} to fetch ${url}`);

      if (options.type) console.log("Request Type:", options.type);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      if (!response.ok) console.warn("Response Message: ", response.message);
      const data = await response.json();
      console.log("Retrieved:", data);
      if (!Array.isArray(data)) {
        if (data.value && Array.isArray(data.value)) {
          return data.value; // handle case where data is wrapped in 'value'
        } else throw new Error("Expected array");
      }
      return data;
    } catch (err) {
      console.warn(`Attempt ${attempt} failed:`, err.message);

      if (attempt < retries) await new Promise((res) => setTimeout(res, delay));
    }
  }
  return []; // fallback if all retries fail
}

export async function allBranches() {
  console.log("allBranches called");
  return await fetchWithRetry(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "allBranches" }),
  });
}

export async function allLOs() {
  return await fetchWithRetry(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "allLOs" }),
  });
}

export async function findUserReviews(userId) {
  return await fetchWithRetry(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "findUserReviews", userId }),
  });
}

export async function addReview(userId, reviewer, rating, message = null) {
  console.log("Adding review for user:", userId);
  return await fetchWithRetry(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "addReview",
      userId,
      reviewer,
      rating,
      message,
    }),
  });
}

export async function zapier(bodyData) {
  const options = {
    method: "POST",
    body: JSON.stringify(bodyData),
  };
  return await fetch(BASE_URL, options);
}

export async function verifyRecaptcha(token) {
  return await fetchWithRetry(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "verifyRecaptcha",
      recaptchaToken: token,
      type: "",
    }),
  });
}
