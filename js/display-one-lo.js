import { getBranches, arrayToMap } from "./branch-data.js";
import { getUserData } from "./user-data.js";

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
  // console.log("User found in cache:", user);

  renderUser(user);
}
// SECTION: Populate page with user data
async function renderUser(user) {
  // SECTION: UPDATE SITE TITLE
  document.title = `${user.firstName} ${user.lastName} | ESRE`;

  // SECTION: Prepare data
  const branchArray = await getBranches();
  const branches = arrayToMap(branchArray, "branchId");
  if (!branches || branches.size === 0) {
    console.warn("No branches found or API call failed.");
  }
  // SECTION: Get container and clear previous content
  const container = document.getElementById("userContainer");
  container.innerHTML = ""; // Clear out previous content
  // SECTION: Check if user data is valid
  if (!user || Object.keys(user).length === 0) {
    container.innerHTML = "<p>No user data found.</p>";
    return;
  }
  // SECTION: Define user properties
  const fullName = `${user["firstName"] ?? ""} ${
    user["lastName"] ?? ""
  }`.trim();
  const title = (user["title"] ?? []).join(" / ") || "Agent";
  const branchName = branches.get(user["branchId"])?.name ?? "N/A";

  // SECTION: Build basic info field display
  const fields = [
    { label: "DRE #", value: user["dre"] },
    { label: "Branch", value: branchName },
    { label: "Phone", value: user["primaryPhone"] },
    { label: "Email", value: user["primaryEmail"] },
    { label: "Secondary Phone", value: user["secondaryPhone"] },
    // { label: "Secondary Email", value: user["secondaryEmail"] },
  ];
  // Populate fields with fields array
  const fieldHtml = fields
    .filter(({ value }) => value && value.toString().trim() !== "")
    .map(
      ({ label, value }) => `
        <div class="d-flex mb-2">
          <strong class="me-2">${label}:</strong> <span>${value}</span>
        </div>`
    )
    .join("");

  // SECTION: Render user info into container
  container.innerHTML = `
    <h4>${fullName}</h4>
    <div>${fieldHtml}</div>`;
  // <ul class="style-none d-flex align-items-center social-icon mt-3">
  //   <li><a href="#"><i class="fa-brands fa-whatsapp"></i></a></li>
  //   <li><a href="#"><i class="fa-brands fa-x-twitter"></i></a></li>
  //   <li><a href="#"><i class="fa-brands fa-instagram"></i></a></li>
  //   <li><a href="#"><i class="fa-brands fa-viber"></i></a></li>
  // </ul>

  // SECTION: Add "Apply Now" button if POS URL exists
  // if (user["posURL"]?.trim()) {
  //   const button = document.createElement("button");
  //   button.className = "btn-nine text-uppercase w-100 mb-20 mt-10";
  //   button.textContent = "Apply Now";
  //   button.onclick = () => window.open(user["posURL"], "_blank");
  //   container.appendChild(button);
  // }

  // SECTION: Update breadcrumb name
  const breadcrumb = document.getElementById("breadcrumbLoanOfficerName");
  if (breadcrumb) {
    breadcrumb.innerText = fullName;
  }

  // SECTION: Update image wrapper with profile photo and tag
  const wrapper = document.getElementById("loanOfficerImageWrapper");
  const iconURL = user.iconURL?.trim() || "images/lazy.svg";

  wrapper.classList.toggle("bg-dark", !user.iconURL?.trim());
  wrapper.classList.toggle("bg-white", !!user.iconURL?.trim());
  wrapper.style.backgroundImage = `url(${iconURL})`;
  wrapper.style.backgroundSize = "contain";
  wrapper.style.backgroundPosition = "center";

  wrapper.innerHTML = `
    <div class="tag bg-white position-absolute text-uppercase" style="top: 50px; left: 10px;">
      ${branchName}
    </div>
  `;

  // SECTION: Set bio if available
  const bioContainer = document.getElementById("loanOfficerBio");
  if (bioContainer && user["bio"]?.trim()) {
    bioContainer.innerHTML = user["bio"];
  }

  // SECTION: Add custom "INQUIRY" mail button that CCs another address
  let contactForm = document.getElementById("contactForm");
  const emailToUse =
    user.primaryEmail?.trim() ||
    user.secondaryEmail?.trim() ||
    user.externalEmail?.trim() ||
    null;

  if (emailToUse) {
    const inquiry = document.createElement("button");
    inquiry.className = "btn-nine text-uppercase w-100 mb-20";
    inquiry.textContent = "INQUIRE";
    inquiry.type = "submit"; // Prevent default form behavior

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Stop actual form submission

      const form = e.target;
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const message = form.message.value.trim();

      if (!email || !phone || !message) {
        alert("Please fill out all required fields.");
        return;
      }

      // Choose which user email to use
      const emailToUse =
        user.primaryEmail?.trim() ||
        user.secondaryEmail?.trim() ||
        user.externalEmail?.trim() ||
        null;

      if (!emailToUse) {
        alert("No email address available to send inquiry.");
        return;
      }

      const ccEmail = "ithelp@equitysmartloans.com";
      const subject = `Inquiry for ${user.firstName} ${user.lastName}`;
      const body = `Hello ${user.firstName},\n\n${message}\n\nPhone: ${phone}\nEmail: ${email}\n\nBest regards,`;

      const mailtoURL = `mailto:${emailToUse}?cc=${encodeURIComponent(
        ccEmail
      )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`;

      // console.log("Submitting inquiry via mailto:", mailtoURL);
      window.location.href = mailtoURL;
    });

    contactForm.appendChild(inquiry);
  } else {
    contactForm.innerHTML = "";
  }
  // SECTION: Add custom "CALL NOW" phone button
  const phoneToUse =
    user.primaryPhone?.trim() || user.secondaryPhone?.trim() || null;
  if (phoneToUse) {
    const callButton = document.createElement("button");
    callButton.className = "btn-nine text-uppercase w-100 mb-20";
    callButton.textContent = "CALL NOW";
    callButton.type = "button";

    callButton.onclick = () => {
      const phone = user.primaryPhone.replace(/\D/g, ""); // strip non-digits
      const telURL = `tel:${phone}`;
      // console.log("CALL NOW button clicked:", telURL);
      window.location.href = telURL;
    };

    contactForm.appendChild(callButton);
  }

  // SECTION: Update Realtor Listings
  // const listings = await getListings();
  // const listingsContainer = document.getElementById("isotop-gallery-wrapper");
  // // console.log("Listings loaded:", listings.length);

  // // Filter listings for the specific agent
  // const userListings = listings.filter((listing) => {
  //   const agentName = listing.ListAgentFullName?.toLowerCase().trim();
  //   const agentFirstName = listing.ListAgentFirstName?.toLowerCase().trim();
  //   const agentLastName = listing.ListAgentLastName?.toLowerCase().trim();

  //   const userName = fullName.toLowerCase().trim();
  //   const userFirstName = user.firstName?.toLowerCase().trim();
  //   const userLastName = user.lastName?.toLowerCase().trim();

  //   return (
  //     agentName === userName ||
  //     (agentFirstName === userFirstName && agentLastName === userLastName) ||
  //     (agentName.includes(userFirstName) && agentName.includes(userLastName)) ||
  //     (userName.includes(agentFirstName) && userName.includes(agentLastName))
  //   );
  // });

  // console.log("Filtered user listings:", userListings.length);

  // // Clear previous content
  // listingsContainer.innerHTML = `<div class="grid-sizer"></div>`;
  // if (!userListings?.length) {
  //   document.getElementById("listingsContainer").classList.add("d-none");
  // }
  // // Render each listing
  // for (const listing of userListings) {
  //   const listingItem = document.createElement("div");
  //   listingItem.className = "isotop-item";

  //   // Add status class
  //   switch (listing.MlsStatus) {
  //     case "Active":
  //       listingItem.classList.add("open");
  //       break;
  //     case "Pending":
  //       listingItem.classList.add("pending");
  //       break;
  //     case "Closed":
  //       listingItem.classList.add("closed");
  //       break;
  //   }

  //   // Build address
  //   const address = [
  //     listing.UnparsedAddress,
  //     listing.City,
  //     listing.PostalCode,
  //     listing.StateOrProvince,
  //   ]
  //     .filter(Boolean)
  //     .join(", ");

  //   // Images
  //   const images = Array.isArray(listing.imageUrls) ? listing.imageUrls : [];
  //   const mainImage = images[0] || "images/listing/img_70.jpg";

  //   // Fancybox group name to avoid cross-mixing galleries
  //   const fancyGroup = `gallery-${listing.ListingKey}`;

  //   const sliderAnchors = images
  //     .map(
  //       (url) => `
  //     <a href="${url}" class="d-block" data-fancybox="${fancyGroup}" data-caption="${address}"></a>`
  //     )
  //     .join("");

  //   // Build listing card HTML
  //   listingItem.innerHTML = `
  //   <div class="listing-card-one shadow-none style-two mb-50">
  //     <div class="img-gallery">
  //       <div class="position-relative overflow-hidden">
  //         <div class="tag bg-white text-dark fw-500">
  //           ${listing.MlsStatus || "N/A"}
  //         </div>
  //         <img src="${mainImage}" class="w-100" alt="${address}" loading="lazy"/>

  //         <div class="img-slider-btn">
  //           ${images.length} <i class="fa-regular fa-image"></i>
  //           ${sliderAnchors}
  //         </div>
  //       </div>
  //     </div>
  //     <!-- /.img-gallery -->

  //     <div class="property-info d-flex justify-content-between align-items-end pt-30">
  //       <div class ="pe-1">
  //         <strong class="price fw-500 color-dark">
  //           $${Number(listing.ListPrice || 0).toLocaleString()}
  //         </strong>
  //         <div class="address pt-5 m0">${address}</div>
  //       </div>
  //       <a href="listing_details.html?listingKey=${
  //         listing.ListingKey
  //       }" class="btn-four mb-5">
  //         <i class="bi bi-arrow-up-right"></i>
  //       </a>
  //     </div>
  //     <!-- /.property-info -->
  //   </div>
  // `;

  //   listingsContainer.appendChild(listingItem);
  // }
}

// SECTION: Initialize the page
window.addEventListener("DOMContentLoaded", async () => {
  await getUserData(); // If this populates userCache
  await getBranches(); // Loads branchCache
  await loadUserCached(userId); // Reads from userCache and renders
});
