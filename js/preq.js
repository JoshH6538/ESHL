import { zapier } from "./api.js";

function camelize(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

document.addEventListener("DOMContentLoaded", () => {
  const steps = ["#step0", "#step1", "#step2", "#step3", "#step4", "#step5"];
  const tabPanes = document.querySelectorAll(".tab-pane");
  const indicators = document.querySelectorAll(
    "#form-step-indicator .nav-link"
  );
  const form = document.getElementById("preq-form");

  function showStep(index) {
    tabPanes.forEach((pane, i) => {
      pane.classList.toggle("show", i === index);
      pane.classList.toggle("active", i === index);
    });

    indicators.forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });
  }

  // Handle Next/Back buttons
  document
    .querySelectorAll("button[data-bs-target^='#step']")
    .forEach((button) => {
      button.addEventListener("click", (e) => {
        const targetId = button.getAttribute("data-bs-target");
        const nextIndex = steps.indexOf(targetId);
        const currentPane = button.closest(".tab-pane");

        if (nextIndex > -1 && currentPane) {
          const inputs = currentPane.querySelectorAll(
            "input, select, textarea"
          );
          let valid = true;

          inputs.forEach((input) => {
            if (!input.checkValidity()) {
              if (valid) {
                input.reportValidity();
                valid = false;
              }
            }
          });

          if (valid) {
            showStep(nextIndex);
          }
        }
      });
    });

  // Handle Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const body = `
Loan Details
\tLoan Type: ${camelize(data.get("loan_type"))}

Home Details
\tHome Type: ${camelize(data.get("home_type"))}
\tProperty Use: ${camelize(data.get("property_use"))}
\tState: ${camelize(data.get("state"))}
Zip Code: ${data.get("zip_code")}

Credit
\tEstimated Credit Score: ${data.get("credit_score")}

Contact Info
\tFirst Name: ${data.get("first_name")}
\tLast Name: ${data.get("last_name")}
\tPhone: ${data.get("phone")}
Email: ${data.get("email")}

About Client
\tEmployment Status: ${camelize(data.get("employment_status"))}
\tLoan Officer: ${data.get("loan_officer") || "N/A"}
\tHeard About Us: ${data.get("referral_source")}
`;

    const subject = `New Pre-Approval Submission from ${data.get(
      "first_name"
    )} ${data.get("last_name")}`;
    const mailtoLink = `mailto:bobbyd@equitysmartloans.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    // Test Zapier integration
    const zapierData = {
      action: "notifyZapier",
      email: data.get("email"),
      firstname: data.get("first_name"),
      lastname: data.get("last_name"),
      prState: camelize(data.get("state")),
      borcreditscore: data.get("credit_score"),
      borempinfoEmpType: camelize(data.get("employment_status")),
      propopertyUse: camelize(data.get("property_use")),
      qkapppropertyType: camelize(data.get("home_type")),
      purpose: camelize(data.get("loan_type")),
      phone: data.get("phone"),
      "Where did you hear about us?": camelize(data.get("referral_source")),
      prZipCode: data.get("zip_code"),
      "Working With One Of Our Loan Officers?":
        data.get("loan_officer") || "N/A",
      mstrstatus1: "New",
    };
    zapier(zapierData);

    window.location.href = mailtoLink;
  });
});
