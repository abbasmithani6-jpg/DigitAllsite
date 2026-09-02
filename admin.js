import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";// // Initialize EmailJS with Public Key
(function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init("l9xhVDI7VRC5H1tqk");
  }
})();
document.addEventListener('DOMContentLoaded', () => {
  const createBtn = document.getElementById('btnCreatePromo');
  
  if (!createBtn) {
    console.error("Could not find btnCreatePromo element on the page!");
    return;
  }

  createBtn.addEventListener('click', async () => {
    const codeInput = document.getElementById('newPromoCode').value.trim().toUpperCase();
    const typeInput = document.getElementById('newPromoType').value;
    const valueInput = Number(document.getElementById('newPromoValue').value);
    const maxUsesInput = Number(document.getElementById('newPromoMaxUses').value);
    const msg = document.getElementById('adminPromoMessage');

    console.log("Create promo clicked for:", codeInput);

    if (!codeInput || isNaN(valueInput) || valueInput <= 0) {
      msg.style.color = "#ef4444";
      msg.textContent = "Please enter a valid code and a non-zero value.";
      return;
    }

    try {
      // Make sure 'doc', 'setDoc', and 'db' are imported at the top of your admin.js file from Firebase
      const promoRef = doc(db, "promocodes", codeInput);
      
      await setDoc(promoRef, {
        code: codeInput,
        type: typeInput,
        value: valueInput,
        maxUses: maxUsesInput,
        currentUses: 0
      });

      msg.style.color = "#00ff87";
      msg.textContent = `Promo code "${codeInput}" created successfully!`;
      
      // Clear form fields
      document.getElementById('newPromoCode').value = '';
      document.getElementById('newPromoValue').value = '';
    } catch (err) {
      console.error("Error creating promo code:", err);
      msg.style.color = "#ef4444";
      msg.textContent = "Error creating promo code. Check console.";
    }
  });
});
// Outlook-Style Autocomplete Logic
document.addEventListener('DOMContentLoaded', function() {
  const nameInput = document.getElementById('admin-user-name');
  const emailInput = document.getElementById('admin-user-email');
  const nameList = document.getElementById('name-suggestions');
  const emailList = document.getElementById('email-suggestions');

  function setupAutocomplete(inputElem, listElem) {
    if (!inputElem || !listElem) return;

    inputElem.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();
      listElem.innerHTML = '';

      if (!query || !window.allUsers || window.allUsers.length === 0) {
        listElem.classList.remove('active');
        return;
      }

      // Search users matching name or email
      const matches = window.allUsers.filter(u => {
        const nameMatch = u.name && u.name.toLowerCase().includes(query);
        const emailMatch = u.email && u.email.toLowerCase().includes(query);
        return nameMatch || emailMatch;
      });

      if (matches.length === 0) {
        listElem.classList.remove('active');
        return;
      }

      // Display top 5 matches
      matches.slice(0, 5).forEach(user => {
        const li = document.createElement('li');
        li.className = 'autocomplete-item';
        li.innerHTML = `<strong>${user.name || 'No Name'}</strong><span>${user.email || 'No Email'}</span>`;
        
        li.addEventListener('click', function() {
          if (nameInput) nameInput.value = user.name || '';
          if (emailInput) emailInput.value = user.email || '';
          if (nameList) nameList.classList.remove('active');
          if (emailList) emailList.classList.remove('active');
        });

        listElem.appendChild(li);
      });

      listElem.classList.add('active');
    });
  }

  setupAutocomplete(nameInput, nameList);
  setupAutocomplete(emailInput, emailList);

  // Close suggestions when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#emailTab')) {
      if (nameList) nameList.classList.remove('active');
      if (emailList) emailList.classList.remove('active');
    }
  });
});

// Delegated Click Listener for Email Dispatch
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
      email: recipientEmail,
      to_email: recipientEmail,
      to_name: recipientName,
      promo_code: promoCode
    };

    emailjs.send("service_lstv048", "template_qmzey9e", templateParams)
      .then(function(response) {
        alert("Promo code email sent successfully to " + recipientEmail + "!");
        document.getElementById('admin-user-email').value = "";
        document.getElementById('admin-user-name').value = "";
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
