// ------------------ FUNCTIONALITY FOR CALCULATOR ------------------
function formatMoney(value) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted;
}

function addSubmitListener(formId, callback) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    callback();
  });
}

function showResultsAnimated(prefix) {
  const resultSection = document.getElementById(`${prefix}_results`);
  if (!resultSection) return;

  resultSection.classList.remove("d-none", "animated", "fadeInUp");
  void resultSection.offsetWidth;
  resultSection.classList.add("animated", "fadeInUp");

  const rect = resultSection.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const offset = (rect.top + scrollTop) * 0.75;
  window.scrollTo({
    top: offset,
    behavior: "smooth",
  });
}

function getInputValues(prefix) {
  const get = (id) =>
    parseFloat(
      document
        .getElementById(`${prefix}_${id}`)
        ?.value.replace(/[^\d.]/g, "") || 0
    );

  return {
    price: get("price") || 0,
    termYears: parseInt(
      document.getElementById(`${prefix}_term`)?.value || "0"
    ),
    down: get("down") || 0,
    tax: get("tax") || 0,
    insurance: get("insurance") || 0,
    hoa: get("hoa") || 0,
    rate: get("rate") || 0,
  };
}

function setOutputValues(prefix, values) {
  const set = (id, value) => {
    const element = document.getElementById(`${prefix}_result_${id}`);
    if (element) {
      element.textContent = formatMoney(value);
    }
  };

  set("total", values.total);
  set("pi", values.principalInterest);
  set("tax", values.tax);
  set("hoa", values.hoa);
  set("insurance", values.insurance);
}
function bindRangeToInput(sliderId, inputId) {
  const range = document.getElementById(sliderId);
  const input = document.getElementById(inputId);
  if (!range || !input) return;

  range.addEventListener("input", () => (input.value = range.value));
  input.addEventListener("input", () => (range.value = input.value));
}
function connectRanges(prefixes) {
  prefixes.forEach((prefix) => {
    const rangeInput = document.getElementById(`${prefix}_interest_range`);
    const outputInput = document.getElementById(`${prefix}_rate`);
    if (rangeInput && outputInput) {
      bindRangeToInput(rangeInput.id, outputInput.id);
    }
    if (prefix === "conv") {
      const pmiInput = document.getElementById("conv_pmi_rate");
      const pmiRange = document.getElementById("conv_pmi_range");
      if (pmiInput && pmiRange) {
        bindRangeToInput(pmiRange.id, pmiInput.id);
      }
    }
  });
}

// ------------------ CONVENTIONAL CALCULATOR ------------------
function calculateConventional() {
  const { price, termYears, down, tax, insurance, hoa, rate } =
    getInputValues("conv");
  const pmi = parseFloat(document.getElementById("conv_pmi_rate").value);

  const principal = price - down;
  const r = rate / 100 / 12;
  const n = termYears * 12;
  const principalInterestPayment =
    (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const monthlyTax = tax / 12;
  const monthlyInsurance = insurance / 12;
  //   If LTV is less than 80%, then do not need to pay PMI.
  const monthlyPMI = (principal * pmi) / 100 / 12;

  const totalMonthly =
    principalInterestPayment + monthlyTax + monthlyInsurance + hoa + monthlyPMI;

  setOutputValues("conv", {
    total: totalMonthly,
    principalInterest: principalInterestPayment,
    tax: monthlyTax,
    hoa: hoa,
    insurance: monthlyInsurance,
  });

  if (principal / price <= 0.8) {
    document.getElementById("conv_result_pmi").textContent =
      "0.00 - PMI not required for LTV < 80%";
  } else {
    document.getElementById("conv_result_pmi").textContent =
      formatMoney(monthlyPMI);
  }

  if (!isNaN(totalMonthly) && totalMonthly > 0) {
    showResultsAnimated("conv");
  }
}

// ------------------ FHA CALCULATOR ------------------
function calculateFHA() {
  const { price, termYears, down, tax, insurance, hoa, rate } =
    getInputValues("fha");

  const principal = price - down;
  const upfrontMIP = 0.0175 * principal; // Upfront MIP for FHA
  const totalFinanced = principal + upfrontMIP; // Add upfront MIP to principal
  const monthlyMIP = (0.0051 * totalFinanced) / 12; // Monthly MIP for FHA
  const r = rate / 100 / 12;
  const n = termYears * 12;
  const principalInterestPayment =
    (totalFinanced * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const monthlyTax = tax / 12;
  const monthlyInsurance = insurance / 12;

  const totalMonthly =
    principalInterestPayment + monthlyTax + monthlyInsurance + hoa + monthlyMIP;

  setOutputValues("fha", {
    total: totalMonthly,
    principalInterest: principalInterestPayment,
    tax: monthlyTax,
    hoa: hoa,
    insurance: monthlyInsurance,
  });
  document.getElementById("fha_result_upfront_mip").textContent =
    formatMoney(upfrontMIP);
  document.getElementById("fha_result_monthly_mip").textContent =
    formatMoney(monthlyMIP);
  if (!isNaN(totalMonthly) && totalMonthly > 0) {
    showResultsAnimated("fha");
  }
}

// ------------------ VA CALCULATOR ------------------
function calculateVA() {
  const { price, termYears, down, tax, insurance, hoa, rate } =
    getInputValues("va");
  const isFirstTime = document.getElementById("va_first_time").value === "yes";

  const baseLoan = price - down;

  // Funding fee logic
  let fundingFeeRate;
  if (down / price >= 0.05) {
    fundingFeeRate = 0.015; // If down payment is 5% or more
  } else {
    fundingFeeRate = isFirstTime ? 0.0215 : 0.033; // 2.15% for first use, 3.3% otherwise
  }

  const fundingFee = baseLoan * fundingFeeRate;
  const financedLoan = baseLoan + fundingFee;

  const r = rate / 100 / 12;
  const n = termYears * 12;

  const monthlyPI =
    (financedLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const monthlyTax = tax / 12;
  const monthlyInsurance = insurance / 12;

  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + hoa;

  // Update output fields
  setOutputValues("va", {
    total: totalMonthly,
    principalInterest: monthlyPI,
    tax: monthlyTax,
    hoa: hoa,
    insurance: monthlyInsurance,
  });

  document.getElementById("va_result_funding_fee").textContent =
    formatMoney(fundingFee);
  document.getElementById("va_result_financed").textContent =
    formatMoney(financedLoan);

  if (!isNaN(totalMonthly) && totalMonthly > 0) {
    showResultsAnimated("va");
  }
}
// ------------------ Affordability CALCULATOR ------------------
function calculateAffordability() {
  const { price, termYears, down, tax, insurance, hoa, rate } =
    getInputValues("af");

  const principal = price - down;
  const r = rate / 100 / 12;
  const n = termYears * 12;
  const principalInterestPayment =
    (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const monthlyTax = tax / 12;
  const monthlyInsurance = insurance / 12;

  const totalMonthly = principalInterestPayment + monthlyTax + monthlyInsurance;

  const annualIncome = parseFloat(
    document.getElementById("af_income").value.replace(/[^\d.]/g, "") || 0
  );
  const monthlyDebts =
    document.getElementById("af_debts").value.replace(/[^\d.]/g, "") || 0;
  const grossMonthlyIncome = annualIncome / 12;
  const maxDTIRatio = 0.43;
  const maxTotalDebt = grossMonthlyIncome * maxDTIRatio;
  const availableForHousing = maxTotalDebt - monthlyDebts;
  const maxPI = availableForHousing - monthlyTax - monthlyInsurance;

  const maxLoanAmount =
    maxPI * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));

  setOutputValues("af", {
    total: totalMonthly,
    principalInterest: principalInterestPayment,
    tax: monthlyTax,
    insurance: monthlyInsurance,
  });

  document.getElementById("af_result_afford").textContent = formatMoney(
    maxLoanAmount > 0 ? maxLoanAmount : 0
  );

  if (!isNaN(totalMonthly) && totalMonthly > 0) {
    showResultsAnimated("af");
  }
}

// ------------------ Refinance CALCULATOR ------------------
function calculateRefinance() {
  const parseValue = (id) =>
    parseFloat(document.getElementById(id).value.replace(/[^\d.]/g, "") || 0);

  const currentAmount = parseValue("ref_current_amount");
  const currentRate = parseValue("ref_current_rate");
  const currentTerm = parseValue("ref_current_term");

  const newAmount = parseValue("ref_new_amount");
  const newRate = parseValue("ref_new_rate");
  const newTerm = parseValue("ref_new_term");

  const fees = parseValue("ref_fees");

  const r1 = currentRate / 100 / 12;
  const n1 = currentTerm;
  const currentMonthly =
    (currentAmount * r1 * Math.pow(1 + r1, n1)) / (Math.pow(1 + r1, n1) - 1);

  const r2 = newRate / 100 / 12;
  const n2 = newTerm;
  const newMonthly =
    (newAmount * r2 * Math.pow(1 + r2, n2)) / (Math.pow(1 + r2, n2) - 1);

  const monthlySavings = currentMonthly - newMonthly;
  const lifetimeSavings = monthlySavings * newTerm - fees;

  // Set values in the UI
  document.getElementById("ref_result_new_payment").textContent =
    formatMoney(newMonthly);
  document.getElementById("ref_result_monthly_savings").textContent =
    formatMoney(monthlySavings);
  document.getElementById("ref_result_fees").textContent = formatMoney(fees);
  document.getElementById("ref_result_lifetime_savings").textContent =
    formatMoney(lifetimeSavings);

  // Show results
  if (!isNaN(newMonthly) && newMonthly > 0) {
    showResultsAnimated("ref");
  }
}

// ------------------ INITIALIZATION ------------------
// Add event listeners

// Initialize WOW.js for animations
// Handle tab switching for desktop
document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => {
  tab.addEventListener("shown.bs.tab", function (e) {
    const targetId = e.target.getAttribute("data-bs-target");
    const content = document.querySelector(targetId);

    if (content) {
      // Reset WOW classes to retrigger animation
      content.classList.remove("animated", "fadeInUp");
      void content.offsetWidth; // force reflow
      content.classList.add("animated", "fadeInUp");
    }
  });
});

// Handle tab switching for mobile
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("mobile-tab-dropdown");

  if (dropdown) {
    dropdown.addEventListener("change", (e) => {
      const tabTarget = e.target.value;
      const targetTab = document.querySelector(
        `.nav-link[data-bs-target="${tabTarget}"]`
      );

      if (targetTab) {
        const tab = new bootstrap.Tab(targetTab);
        tab.show();
      }
    });
  }
});

// Syncs tab changes between desktop and mobile
document.querySelectorAll("#mortgage-tablist .nav-link").forEach((tabEl) => {
  tabEl.addEventListener("shown.bs.tab", (e) => {
    const activeTarget = e.target.getAttribute("data-bs-target");
    const dropdown = document.getElementById("mobile-tab-dropdown");
    if (dropdown) dropdown.value = activeTarget;
  });
});

addSubmitListener("conventional-form", calculateConventional);
addSubmitListener("fha-form", calculateFHA);
addSubmitListener("va-form", calculateVA);
addSubmitListener("affordability-form", calculateAffordability);
addSubmitListener("refinance-form", calculateRefinance);

// Handle range input for interest rate
connectRanges(["conv", "fha", "va", "af", "ref"]);
