// ------------------ CONVENTIONAL CALCULATOR ------------------
function calculateConventional() {
  const price = parseFloat(
    document.getElementById("conv_price").value.replace(/[^\d.]/g, "")
  );
  const termYears = parseInt(document.getElementById("conv_term").value);
  const down = parseFloat(
    document.getElementById("conv_down").value.replace(/[^\d.]/g, "")
  );
  const tax = parseFloat(
    document.getElementById("conv_tax").value.replace(/[^\d.]/g, "")
  );
  const insurance = parseFloat(
    document.getElementById("conv_insurance").value.replace(/[^\d.]/g, "")
  );
  const hoa = parseFloat(
    document.getElementById("conv_hoa").value.replace(/[^\d.]/g, "")
  );
  const rate = parseFloat(document.getElementById("conv_rate").value);
  const pmi = parseFloat(document.getElementById("conv_pmi").value);

  //   if (
  //     isNaN(price) ||
  //     isNaN(termYears) ||
  //     isNaN(down) ||
  //     isNaN(tax) ||
  //     isNaN(insurance) ||
  //     isNaN(hoa) ||
  //     isNaN(rate)
  //   ) {
  //     alert("Please fill in all fields with valid numbers.");
  //     return;
  //   }

  const principal = price - down;
  const r = rate / 100 / 12;
  const n = termYears * 12;
  const principalInterestPayment =
    (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const monthlyTax = tax / 12;
  const monthlyInsurance = insurance / 12;
  const monthlyPMI = (principal * pmi) / 100 / 12;
  const totalMonthly =
    principalInterestPayment + monthlyTax + monthlyInsurance + hoa + monthlyPMI;

  document.getElementById("conv_result_total").textContent =
    totalMonthly.toFixed(2);
  document.getElementById("conv_result_pi").textContent =
    principalInterestPayment.toFixed(2);
  document.getElementById("conv_result_tax").textContent =
    monthlyTax.toFixed(2);
  document.getElementById("conv_result_hoa").textContent = hoa.toFixed(2);
  document.getElementById("conv_result_insurance").textContent =
    monthlyInsurance.toFixed(2);
  document.getElementById("conv_result_pmi").textContent =
    monthlyPMI.toFixed(2);
  if (!isNaN(totalMonthly) && totalMonthly > 0) {
    const resultSection = document.getElementById("conv_result_section");

    window.scrollTo({
      top: document.getElementById("result_section").offsetTop,
      behavior: "smooth",
    });
    // Reset WOW classes to retrigger animation

    resultSection.classList.remove("d-none");
    resultSection.classList.remove("animated", "fadeInUp");
    void resultSection.offsetWidth; // force reflow
    resultSection.classList.add("animated", "fadeInUp");
  }
}

// Initialize WOW.js for animations
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

// Add event listener to the calculate form
document
  .getElementById("conventional-form")
  ?.addEventListener("submit", (event) => {
    event.preventDefault();
    calculateConventional();
  });

// Handle range input for interest rate
const interestInput = document.getElementById("interestRange");
const interestOutput = document.getElementById("conv_rate");
const pmiInput = document.getElementById("pmiRange");
const pmiOutput = document.getElementById("conv_pmi");
let rangePairs = [
  { input: interestInput, output: interestOutput },
  { input: pmiInput, output: pmiOutput },
];

rangePairs.forEach(({ input, output }) => {
  output.textContent = interestInput.value || 0;
  input.addEventListener("input", function () {
    output.value = this.value;
  });
  output.addEventListener("input", function () {
    input.value = this.value;
  });
});

function calculateFHA() {
  const price = parseFloat(
    document.getElementById("conv_price").value.replace(/[^\d.]/g, "")
  );
  const termYears = parseInt(document.getElementById("conv_term").value);
  const down = parseFloat(
    document.getElementById("conv_down").value.replace(/[^\d.]/g, "")
  );
  const tax = parseFloat(
    document.getElementById("conv_tax").value.replace(/[^\d.]/g, "")
  );
  const insurance = parseFloat(
    document.getElementById("conv_insurance").value.replace(/[^\d.]/g, "")
  );
  const hoa = parseFloat(
    document.getElementById("conv_hoa").value.replace(/[^\d.]/g, "")
  );
  const rate = parseFloat(document.getElementById("conv_rate").value);

  //   if (
  //     isNaN(price) ||
  //     isNaN(termYears) ||
  //     isNaN(down) ||
  //     isNaN(tax) ||
  //     isNaN(insurance) ||
  //     isNaN(hoa) ||
  //     isNaN(rate)
  //   ) {
  //     alert("Please fill in all fields with valid numbers.");
  //     return;
  //   }

  const principal = price - down;
  const r = rate / 100 / 12;
  const n = termYears * 12;
  const principalInterestPayment =
    (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const monthlyTax = tax / 12;
  const monthlyInsurance = insurance / 12;
  const monthlyPMI = (principal * 0.005) / 12; // example PMI estimate
  const totalMonthly =
    principalInterestPayment + monthlyTax + monthlyInsurance + hoa + monthlyPMI;

  document.getElementById("conv_result_total").textContent =
    totalMonthly.toFixed(2);
  document.getElementById("conv_result_pi").textContent =
    principalInterestPayment.toFixed(2);
  document.getElementById("conv_result_tax").textContent =
    monthlyTax.toFixed(2);
  document.getElementById("conv_result_hoa").textContent = hoa.toFixed(2);
  document.getElementById("conv_result_insurance").textContent =
    monthlyInsurance.toFixed(2);
  document.getElementById("conv_result_pmi").textContent =
    monthlyPMI.toFixed(2);
  if (!isNaN(totalMonthly) && totalMonthly > 0) {
    const resultSection = document.getElementById("conv_result_section");

    window.scrollTo({
      top: document.getElementById("result_section").offsetTop,
      behavior: "smooth",
    });
    // Reset WOW classes to retrigger animation

    resultSection.classList.remove("d-none");
    resultSection.classList.remove("animated", "fadeInUp");
    void resultSection.offsetWidth; // force reflow
    resultSection.classList.add("animated", "fadeInUp");
  }
}
