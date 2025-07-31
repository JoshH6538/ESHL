import { getBranches, arrayToMap } from "./branch-data.js";
import { getUserData, getUserReviews } from "./user-data.js";
import { addReview, verifyRecaptcha } from "./api.js";
import { generateLoader } from "./loading.js";

// Grab the userId from the URL query parameters
const userId = new URLSearchParams(window.location.search).get("userId");

// Grab the user from all users cached in localStorage
async function loadUserCached(userId) {
  // console.log("Loading user from cache...");
  // SECTION: Check if userId is valid
  const raw = localStorage.getItem("userCache");
  if (!raw) {
    console.warn("No userCache found.");
    return;
  }
  // SECTION: Parse the userCache
  let userList;
  try {
    userList = JSON.parse(raw); // Expecting an array
  } catch {
    console.error("userCache is corrupted.");
    return;
  }

  // If the cache was saved as an object/map instead of an array, convert it
  const users = Array.isArray(userList) ? userList : Object.values(userList);

  const user = users.find((u) => u.userId === userId);

  if (!user) {
    console.warn(`No user found for ID: ${userId}`);
    return;
  }
  renderUser(user);
  // console.log("User found in cache:", user);
  // SECTION: Fetch user reviews
  const reviews = await getUserReviews(userId);

  console.log("User reviews fetched:", reviews);
  if (reviews && reviews.length > 0) {
    user.reviews = reviews;
  } else {
    user.reviews = [];
  }
  updateRender(user);
}
// SECTION: Populate page with user data
export async function renderUser(user) {
  document.title = `${user.firstName} ${user.lastName} | ESRE`;

  const branches = arrayToMap(await getBranches(), "branchId");
  const container = document.getElementById("userContainer");
  container.innerHTML = "";

  if (!user || Object.keys(user).length === 0) {
    container.innerHTML = "<p>No user data found.</p>";
    return;
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const branchName = branches.get(user.branchId)?.name ?? "N/A";

  const fields = [
    { label: "NMLS #", value: user.nmls },
    { label: "Branch", value: branchName },
    { label: "Phone", value: user.primaryPhone },
    { label: "Email", value: user.primaryEmail },
    { label: "Secondary Phone", value: user.secondaryPhone },
  ];

  const fieldHtml = fields
    .filter(({ value }) => value && value.toString().trim() !== "")
    .map(
      ({ label, value }) =>
        `<div class="d-flex mb-2"><strong class="me-2">${label}:</strong> <span>${value}</span></div>`
    )
    .join("");

  container.innerHTML = `<h4>${fullName}</h4><div>${fieldHtml}</div>`;

  const breadcrumb = document.getElementById("breadcrumbLoanOfficerName");
  if (breadcrumb) breadcrumb.innerText = fullName;

  const wrapper = document.getElementById("loanOfficerImageWrapper");
  wrapper.style.backgroundImage = `url(${
    user.iconURL?.trim() ||
    "https://equitysmartloans.com/wp-content/uploads/2022/05/placeHolder.jpeg"
  })`;
  wrapper.style.backgroundSize = "contain";
  wrapper.style.backgroundPosition = "center";
  wrapper.innerHTML = `
    <div class="tag bg-white position-absolute text-uppercase" style="top: 50px; left: 10px;">
      ${branchName}
    </div>
  `;

  const bioContainer = document.getElementById("loanOfficerBio");
  if (bioContainer && user.bio?.trim()) {
    bioContainer.innerHTML = user.bio;
  }

  const contactForm = document.getElementById("contactForm");
  contactForm.innerHTML = "";

  const emailToUse =
    user.primaryEmail?.trim() ||
    user.secondaryEmail?.trim() ||
    user.externalEmail?.trim();

  if (emailToUse) {
    const inquiryBtn = document.createElement("button");
    inquiryBtn.className = "btn-nine text-uppercase w-100 mb-20";
    inquiryBtn.textContent = "INQUIRE";
    inquiryBtn.type = "submit";

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const form = e.target;
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const message = form.message.value.trim();

      if (!email || !phone || !message) {
        alert("Please fill out all required fields.");
        return;
      }

      const subject = `Inquiry for ${user.firstName} ${user.lastName}`;
      const body = `Hello ${user.firstName},\n\n${message}\n\nPhone: ${phone}\nEmail: ${email}\n\nBest regards,`;
      const mailtoURL = `mailto:${emailToUse}?cc=${encodeURIComponent(
        "ithelp@equitysmartloans.com"
      )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`;
      window.location.href = mailtoURL;
    });

    contactForm.appendChild(inquiryBtn);
  }

  const phoneToUse = user.primaryPhone?.trim() || user.secondaryPhone?.trim();
  if (phoneToUse) {
    const callBtn = document.createElement("button");
    callBtn.className = "btn-nine text-uppercase w-100 mb-20";
    callBtn.textContent = "CALL NOW";
    callBtn.type = "button";
    callBtn.onclick = () => {
      const telURL = `tel:${phoneToUse.replace(/\D/g, "")}`;
      window.location.href = telURL;
    };
    contactForm.appendChild(callBtn);
  }
}

export async function updateRender(user) {
  const reviews = await getUserReviews(user.userId);
  user.reviews = Array.isArray(reviews) ? reviews : [];

  const commentsContainer = document.getElementById("commentsContainer");
  commentsContainer.innerHTML = "";

  const commentsHeader = document.createElement("h3");
  commentsHeader.className = "blog-inner-title pb-35";
  commentsHeader.textContent = `${user.reviews.length} Reviews`;
  commentsContainer.appendChild(commentsHeader);

  const commentForm = document.getElementById("commentForm");
  if (user.reviews.length === 0) {
    commentsContainer.classList.add("d-none", "col-0");
    commentForm.classList.add("col-12");
    commentForm.classList.remove("col-lg-5");
  }

  user.reviews.forEach((review) => {
    const comment = document.createElement("div");
    comment.className = "comment position-relative d-flex mb-30";
    const starsHtml = "★".repeat(review.rating);
    comment.innerHTML = `
      <div class="comment-text">
        <h5 class="mb-10">${review.reviewer}</h5>
        <span class="date">${new Date(
          review.dateSubmitted
        ).toLocaleDateString()}</span>
        <p style="color: #007dab; font-size: 1.5em">${starsHtml}</p>
        <p>${review.message}</p>
      </div>`;
    commentsContainer.appendChild(comment);
  });
}

// SECTION: Initialize the page
window.addEventListener("DOMContentLoaded", async () => {
  generateLoader(
    [
      "Fetching Loan Officer Details...",
      "Updating Cache...",
      "Rendering Information...",
      "Almost There...",
    ],
    {
      interval: 1500,
      gifSrc: "/images/lazyBlue.svg",
    }
  );
  generateLoader(
    [
      "Fetching Reviews...",
      "Updating Cache...",
      "Rendering Reviews...",
      "Almost There...",
    ],
    {
      selector: ".loader-message.reviews",
      interval: 1500,
      gifSrc: "/images/lazyBlue.svg",
    }
  );
  await getUserData(); // If this populates userCache
  await getBranches(); // Loads branchCache
  await loadUserCached(userId); // Reads from userCache and renders

  // Check if user has already submitted a review within the cooldown period
  const reviewTimeCache = JSON.parse(
    localStorage.getItem("reviewTimeCache") || "{}"
  );
  const cooldownEnd = reviewTimeCache[userId];
  if (cooldownEnd && Date.now() < cooldownEnd) {
    reviewForm.innerHTML = `
        <p class="text-danger">You can only submit one review per hour.</p>
        <p class="text-muted">Please wait until the cooldown period ends.</p>
      `;
    return;
  }
});
