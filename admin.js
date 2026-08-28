// Initialize EmailJS with Public Key
(function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init("l9xhVDI7VRC5H1tqk");
  }
})();

// Delegated click listener guarantees the button click is caught on hosted sites
document.addEventListener('click', function(event) {
  if (event.target && event.target.id === 'send-promo-btn') {
    event.preventDefault();

    const recipientEmail = document.getElementById('admin-user-email')?.value;
    const recipientName = document.getElementById('admin-user-name')?.value || "Customer";
    const promoCode = document.getElementById('admin-promo-code')?.value || "";

    if (!recipientEmail) {
      alert("Please enter a recipient email address.");
      return;
    }

    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.disabled = true;

    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName,
      promo_code: promoCode
    };

    emailjs.send("service_lstv048", "template_qmzey9e", templateParams)
      .then(function(response) {
        alert("Promo code email sent successfully to " + recipientEmail + "!");
        document.getElementById('admin-user-email').value = "";
      })
      .catch(function(error) {
        console.error("EmailJS Error details:", error);
        alert("Failed to send email: " + (error.text || JSON.stringify(error)));
      })
      .finally(function() {
        btn.innerText = originalText;
        btn.disabled = false;
      });
  }
});
