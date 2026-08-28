// Initialize EmailJS with your Public Key
(function() {
  emailjs.init("l9xhVDI7VRC5H1tqk");
})();

// Global click listener guarantees button capture even inside hidden/tabbed sections
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
    
    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName,
      promo_code: promoCode
    };
    
    // Visual feedback while sending
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.disabled = true;
    
    emailjs.send("service_lstv048", "template_qmzey9e", templateParams)
      .then(function(response) {
        alert("Promo code email sent successfully to " + recipientEmail + "!");
        document.getElementById('admin-user-email').value = "";
      })
      .catch(function(error) {
        alert("Failed to send email: " + JSON.stringify(error));
      })
      .finally(function() {
        btn.innerText = originalText;
        btn.disabled = false;
      });
  }
});
