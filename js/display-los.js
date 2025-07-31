import { allLOs } from "./api.js";
import { getBranches, arrayToMap } from "./branch-data.js";
import { getUserData } from "./user-data.js";
import { generateLoader } from "./loading.js";

let allLOsData = []; // now an array
let branchMap = new Map(); // Initialize branchMap
// Load loan officers from localStorage as a JSON array
async function loadLoanOfficers() {
  const raw = localStorage.getItem("userCache");

  if (raw) {
    try {
      allLOsData = JSON.parse(raw); // no Object.values needed
    } catch {
      console.error("userCache is corrupted");
      return;
    }
  } else {
    console.warn("No officer data in localStorage");
    return;
  }
  // Sort the loan officers by last name
  allLOsData.sort((a, b) => {
    const lastNameA = (a.lastName ?? "").toLowerCase();
    const lastNameB = (b.lastName ?? "").toLowerCase();
    return lastNameA.localeCompare(lastNameB);
  });
  // Move all no image cards to the end
  allLOsData.sort((a, b) => {
    const hasIconA = Boolean(a.iconURL);
    const hasIconB = Boolean(b.iconURL);
    return hasIconB - hasIconA; // false (0) goes after true (1)
  });
  renderLoanOfficers(allLOsData);
  updateResultsCount(allLOsData.length);
}

// Render the cards
function renderLoanOfficers(loanOfficerArray) {
  let branches = {};
  const raw = localStorage.getItem("branchCache");
  if (raw) {
    branches = JSON.parse(raw);
  }
  branchMap = arrayToMap(branches, "branchId"); // Ensure branches is a map
  // console.log("Rendering Loan Officers:", loanOfficerArray);
  // console.log("Using Branches:", branchMap);

  const container = document.getElementById("loanOfficerContainer");
  container.innerHTML = "";

  if (loanOfficerArray.length === 0) {
    console.warn("[Render] No loan officers found");
    container.innerHTML = `
      <div class="text-center py-5">
        <p class="fs-4 text-muted">No loan officers found matching your criteria.</p>
      </div>
    `;
    return;
  }

  for (const loanOfficer of loanOfficerArray) {
    const iconURL =
      loanOfficer.iconURL && loanOfficer.iconURL.trim() !== ""
        ? loanOfficer.iconURL
        : "https://equitysmartloans.com/wp-content/uploads/2022/05/placeHolder.jpeg";

    const branch = branchMap.get(loanOfficer.branchId);
    const branchName = branch?.name ?? "Unknown Branch";
    const col = document.createElement("div");
    col.className = "col-xl-3 col-md-4 col-sm-6";

    col.innerHTML = `
      <div class="agent-card-two position-relative z-1 mb-50 wow fadeInUp">
        <div class="media position-relative overflow-hidden">
          <div class="tag bg-white position-absolute text-uppercase">${branchName}</div>
          <a href="loan-officer-details.html?userId=${
            loanOfficer.userId
          }" class="position-relative d-block">
            <img
              loading="lazy"
              src="${iconURL}"
              class="agent-img w-100 tran5s"
              alt=""
            >
          </a>
        </div>
        <div class="text-center pt-30">
          <h6 class="name">
            <a href="loan-officer-details.html?userId=${loanOfficer.userId}">
              ${loanOfficer.firstName ?? "First"} ${
      loanOfficer.lastName ?? "Last"
    }
            </a>
          </h6>
        </div>
      </div>
    `;

    container.appendChild(col);
  }
  // SECTION: FIlter Modal
  const branchFilter = document.getElementById("branchFilter");
  if (branchFilter) {
    branchFilter.innerHTML = ""; // Clear existing content
    // Sort branches by name
    let sortedBranches = Array.from(branchMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // TESTING REMOVE NON CA BRANCHES
    // Filter out branches not in CA
    sortedBranches = sortedBranches.filter((branch) => {
      // Exclude branches with "fl" in
      return (
        !branch.name.toLowerCase().includes(" fl") &&
        !branch.name.toLowerCase().includes("fl ")
      );
    });
    // console.log("[Filter] Branches after CA filter:", sortedBranches);
    sortedBranches.forEach((branch) => {
      const li = document.createElement("li");
      li.classList.add("branch-option");
      li.innerHTML = `
        <input type="checkbox" value="${branch.branchId}" />
        <label><span>${branch.name}</span></label>
      `;
      branchFilter.appendChild(li);
    });
  }
}
//  SECTION: Filter Submit
document
  .getElementById("loanOfficerFilterForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const form = e.target;

    // Get Title
    const title = form.querySelector("select")?.value?.trim();

    // Get Zipcode
    const zipcode = form.querySelector('input[type="text"]')?.value?.trim();

    // Get Checked Branches

    const selectedBranchIds = Array.from(
      form.querySelectorAll("#branchFilter input[type='checkbox']:checked")
    ).map((cb) => cb.value);

    // === Start with full list ===
    let filtered = allLOsData.slice();

    // === Zipcode filter ===
    if (zipcode !== "(none)") {
      filtered = filtered.filter((loanOfficer) => {
        const match = (loanOfficer.zipcode ?? "").startsWith(zipcode);
        return match;
      });
    }

    // === Branch filter ===
    if (selectedBranchIds.length > 0) {
      const selectedBranchSet = new Set(selectedBranchIds); // fast lookup

      filtered = filtered.filter((loanOfficer) => {
        const branchId = loanOfficer.branchId;

        const match = selectedBranchSet.has(branchId);

        return match;
      });
    }

    // === Summary ===
    // console.log(
    //   `[Filter] Final result count: ${filtered.length} of ${allLOsData.length}`
    // );

    // === Sort & Render ===
    const currentSort = document.getElementById("sortSelect").value;
    const sortedFiltered = sortLoanOfficers(filtered, currentSort);

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("advanceFilterModal")
    );
    if (modal) {
      document.activeElement?.blur();
      modal.hide();

      // console.log("[Filter] Modal closed.");
    }

    const clearBtn = document.getElementById("clearFiltersBtn");

    // Check if any filters were used
    if (areFiltersActive({ title, zipcode: zipcode, selectedBranchIds })) {
      clearBtn.classList.remove("d-none");
      // console.log("[UI] Showing Clear Filters button");
    } else {
      clearBtn.classList.add("d-none");
      // console.log("[UI] Hiding Clear Filters button");
    }

    renderLoanOfficers(sortedFiltered);
    updateResultsCount(sortedFiltered.length);
  });

// Check if any filters are active
function areFiltersActive({ title, zipcode, selectedBranchIds }) {
  return (
    title !== "(none)" || zipcode !== "(none)" || selectedBranchIds.length > 0
  );
}
// Clear Filters Functionality
document.getElementById("clearFiltersBtn").addEventListener("click", () => {
  // console.log("[Action] Clear Filters clicked.");

  const form = document.getElementById("loanOfficerFilterForm");

  // Reset all form inputs
  form.reset();

  // Manually uncheck any dynamically generated checkboxes
  form
    .querySelectorAll('#branchFilter input[type="checkbox"]')
    .forEach((cb) => (cb.checked = false));

  // Reset nice-select dropdowns if used
  if (typeof jQuery !== "undefined" && $.fn.niceSelect) {
    $("select").niceSelect("update");
  }

  // Hide the button again
  document.getElementById("clearFiltersBtn").classList.add("d-none");

  // Re-render all loan officers
  renderLoanOfficers(allLOsData);
  updateResultsCount(allLOsData.length);

  // console.log("[Filter] Cleared filters and restored full list.");
});

// Reset Filter Functionality
document
  .getElementById("resetFilterBtn")
  .addEventListener("click", function (e) {
    e.preventDefault(); // prevent jumping to top

    const form = document.getElementById("loanOfficerFilterForm");

    // 1. Reset all form inputs
    form.reset();

    // 2. Manually uncheck any dynamically generated checkboxes (e.g., in #branchFilter)
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });

    // 3. Reset nice-select dropdowns if you're using that library
    if (typeof jQuery !== "undefined" && $.fn.niceSelect) {
      $("select").niceSelect("update"); // refresh the UI
    }

    // console.log("Filters reset");
  });

// Update results count
function updateResultsCount(count) {
  const totalSpan = document.getElementById("total");
  if (totalSpan) totalSpan.textContent = count;
}

// Search form handler
document
  .getElementById("loanOfficerSearchForm")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    const query = document
      .getElementById("searchInput")
      .value.trim()
      .toLowerCase();

    const filtered = allLOsData.filter((loanOfficer) => {
      const name = `${loanOfficer.firstName ?? ""} ${
        loanOfficer.lastName ?? ""
      }`.toLowerCase();
      const dre = (loanOfficer.dre ?? "").toLowerCase();
      const branchName = (
        branchMap.get(loanOfficer.branchId)?.name ?? ""
      ).toLowerCase();

      const zipcode = (loanOfficer.zipcode ?? "").toLowerCase();
      const branchZipcode = (
        branchMap.get(loanOfficer.branchId)?.address?.zipcode ?? ""
      ).toLowerCase();
      const branchCity = (
        branchMap.get(loanOfficer.branchId)?.address?.city ?? ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        dre.includes(query) ||
        branchName.includes(query) ||
        zipcode.includes(query) ||
        branchZipcode.includes(query) ||
        branchCity.includes(query)
      );
    });

    const currentSort = document.getElementById("sortSelect").value;
    const sortedFiltered = sortLoanOfficers(filtered, currentSort);

    if (sortedFiltered.length === 0) {
      document.getElementById("loanOfficerContainer").innerHTML =
        "<p>No loan officers found.</p>";
    } else {
      renderLoanOfficers(sortedFiltered);
    }

    updateResultsCount(sortedFiltered.length);
  });

// Sort function
function sortLoanOfficers(data, sortBy) {
  const [key, order] = sortBy.split("-");

  return data.slice().sort((a, b) => {
    const valA = (a[key] ?? "").toLowerCase();
    const valB = (b[key] ?? "").toLowerCase();

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });
}

// Sort dropdown listener
document.getElementById("sortSelect").addEventListener("change", (e) => {
  const sorted = sortLoanOfficers(allLOsData, e.target.value);
  renderLoanOfficers(sorted);
  updateResultsCount(sorted.length);
});

// Initial setup
window.addEventListener("DOMContentLoaded", async () => {
  generateLoader(
    [
      "Fetching Loan Officers...",
      "Updating Cache...",
      "Rendering Information...",
      "Almost There...",
    ],
    {
      interval: 1500,
      gifSrc: "/images/lazyBlue.svg",
    }
  );
  await getUserData(); // If this populates userCache
  await getBranches(); // Loads branchCache
  await loadLoanOfficers(); // Reads from userCache and renders
});
