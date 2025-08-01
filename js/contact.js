const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default PHP submission
    // Track form submission with Google Analytics
    if (typeof gtag === "function") {
      gtag("event", "contact_form_submit", {
        event_category: "form",
        event_label: "Contact Form",
      });
    }
    const form = e.target;

    const firstName = form.first_name?.value?.trim();
    const lastName = form.last_name?.value?.trim();
    const email = form.email?.value?.trim();
    const phone = form.phone?.value?.trim();
    const city = form.city?.value?.trim();
    const state = form.state?.value?.trim();
    const zipcode = form.zipcode?.value?.trim();
    const message = form.message?.value?.trim();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !city ||
      !state ||
      !zipcode ||
      !message
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    const subject = `New Inquiry from ${firstName} ${lastName}`;
    const body = `
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
City/State/Zip: ${city}, ${state} ${zipcode}

Message:
${message}
    `.trim();

    const mailto = `mailto:ithelp@equitysmartloans.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    console.log("[Contact Form] Drafting email to I.T. Help:", mailto);
    window.location.href = mailto;
  });
}
