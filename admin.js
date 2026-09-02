import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc0-yyvbJH7gk5Fmh6-0u0AI6XTyqrdXU",
  authDomain: "digitall-c77d8.firebaseapp.com",
  projectId: "digitall-c77d8",
  storageBucket: "digitall-c77d8.firebasestorage.app",
  messagingSenderId: "922798712588",
  appId: "1:922798712588:web:43235136b5b1bf58168b29"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global state
window.allUsers = [];

// Initialize EmailJS
(function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init("l9xhVDI7VRC5H1tqk");
  }
})();

// Global Login Handler (Matches your original inline HTML setup)
window.handleLogin = async function() {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login failed:", error);
    alert("Login failed: " + error.message);
  }
};

window.handleLogout = function() {
  signOut(auth);
};

// Tab Switcher
window.switchTab = function(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add('active');
  if (element) element.classList.add('active');
};

// Toggle User Details
window.toggleUserDetails = function(id) {
  const detailsRow = document.getElementById(`user-details-${id}`);
  if (detailsRow) {
    detailsRow.classList.toggle('active');
  }
};

// Real-time Search Filters
window.filterPromos = function() {
  const input = document.getElementById("searchPromoInput");
  if (!input) return;
  const term = input.value.toLowerCase();
  const rows = document.querySelectorAll("#promoTableBody tr");
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(term) ? "" : "none";
  });
};

window.filterUsers = function() {
  const input = document.getElementById("searchUserInput");
  if (!input) return;
  const term = input.value.toLowerCase();
  const rows = document.querySelectorAll("#usersTableBody tr.user-main-row");
  rows.forEach(row => {
    const userId = row.getAttribute('data-id');
    const detailsRow = document.getElementById(`user-details-${userId}`);
    const text = (row.innerText + " " + (detailsRow ? detailsRow.innerText : "")).toLowerCase();
    
    if (text.includes(term)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
      if (detailsRow) detailsRow.classList.remove('active');
    }
  });
};

// Auth Observer
onAuthStateChanged(auth, (user) => {
  const loginScreen = document.getElementById("loginScreen");
  const adminDashboard = document.getElementById("adminDashboard");
  if (user) {
    if (loginScreen) loginScreen.style.display = "none";
    if (adminDashboard) adminDashboard.style.display = "block";
    loadDashboardData();
  } else {
    if (loginScreen) loginScreen.style.display = "block";
    if (adminDashboard) adminDashboard.style.display = "none";
  }
});

// Load Dashboard Data
async function loadDashboardData() {
  try {
    const currentUser = auth.currentUser;
    
    // Load Users
    const usersSnap = await getDocs(collection(db, "users"));
    const usersTable = document.getElementById("usersTableBody");
    if (!usersTable) return;
    usersTable.innerHTML = "";
    
    window.allUsers = [];
    let userCount = 0;
    let foundSelf = false;

    usersSnap.forEach((docSnap) => {
      userCount++;
      const u = docSnap.data();
      if (currentUser && docSnap.id === currentUser.uid) foundSelf = true;
      
      const fullName = (u.firstName || u.lastName) 
        ? `${u.firstName || ""} ${u.lastName || ""}`.trim() 
        : (u.name || u.displayName || "Unnamed User");
        
      const email = u.email || "";
      const role = u.role || (currentUser && docSnap.id === currentUser.uid ? "admin" : "user");
      const safeId = docSnap.id;

      if (email || fullName) {
        window.allUsers.push({ name: fullName, email: email });
      }

      usersTable.innerHTML += `
        <tr class="user-main-row" data-id="${safeId}" onclick="window.toggleUserDetails('${safeId}')">
          <td>
            <strong style="font-size: 15px;">${fullName}</strong>
            <span style="font-size: 11px; color: var(--text-muted); margin-left: 8px;">(Tap for details)</span>
          </td>
        </tr>
        <tr id="user-details-${safeId}" class="user-details-row">
          <td>
            <div class="user-details-container">
              <div class="user-details-grid">
                <div class="user-detail-item">Full Name: <span>${fullName}</span></div>
                <div class="user-detail-item">Email Address: <span>${email || "No email"}</span></div>
                <div class="user-detail-item">User ID: <span><code>${safeId}</code></span></div>
                <div class="user-detail-item">Account Role: <span><span class="badge ${role === 'admin' ? 'badge-admin' : ''}">${role}</span></span></div>
              </div>
            </div>
          </td>
        </tr>`;
    });

    if (!foundSelf && currentUser) {
      userCount++;
      const adminId = currentUser.uid;
      const adminEmail = currentUser.email || "";
      window.allUsers.push({ name: "Admin Account", email: adminEmail });

      usersTable.innerHTML = `
        <tr class="user-main-row" data-id="${adminId}" onclick="window.toggleUserDetails('${adminId}')">
          <td>
            <strong style="font-size: 15px;">Admin Account (You)</strong>
            <span style="font-size: 11px; color: var(--text-muted); margin-left: 8px;">(Tap for details)</span>
          </td>
        </tr>
        <tr id="user-details-${adminId}" class="user-details-row">
          <td>
            <div class="user-details-container">
              <div class="user-details-grid">
                <div class="user-detail-item">Email Address: <span>${adminEmail}</span></div>
                <div class="user-detail-item">User ID: <span><code>${adminId}</code></span></div>
                <div class="user-detail-item">Role: <span><span class="badge badge-admin">admin</span></span></div>
              </div>
            </div>
          </td>
        </tr>` + usersTable.innerHTML;
    }

    const userCounter = document.getElementById("userCounter");
    if (userCounter) userCounter.innerText = userCount;

 // Load Promo Codes
    const promoSnap = await getDocs(collection(db, "promocodes"));
    const promoTable = document.getElementById("promoTableBody");
    if (!promoTable) return;
    promoTable.innerHTML = "";
    
    const promoCounter = document.getElementById("promoCounter");
    if (promoCounter) promoCounter.innerText = promoSnap.size;

    promoSnap.forEach((docSnap) => {
      const p = docSnap.data();
      // Catch different possible field names for type and value
      const type = (p.type || p.discountType || p.category || 'percentage').toLowerCase();
      const val = p.value ?? p.amount ?? p.discountValue ?? p.discountPercent ?? p.val ?? 0;
      const maxUses = p.maxUses ?? p.uses ?? 0;

      let displayValue = "";
      if (type.includes("percent") || type === "%") {
        displayValue = `${val}% Off`;
      } else if (type.includes("fixed") || type.includes("money") || type.includes("flat") || type === "$") {
        displayValue = `$${val} Off`;
      } else if (type.includes("credit")) {
        displayValue = `${val} Credits`;
      } else {
        displayValue = `${val} ${type}`;
      }

      promoTable.innerHTML += `
        <tr>
          <td><strong>${docSnap.id}</strong></td>
          <td><span class="badge">${displayValue}</span></td>
          <td>${p.currentUses ?? p.usesCount ?? 0}</td>
          <td>${maxUses}</td>
          <td>
            <button class="btn-edit" onclick="window.openEditModal('${docSnap.id}', '${type}', ${val}, ${maxUses})">Edit</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error("Data fetch error:", err);
  }
}

// DOMContentLoaded Listeners for Creation & Autocomplete
document.addEventListener('DOMContentLoaded', () => {
  // Create Promo Code Handler
  const createBtn = document.getElementById('btnCreatePromo');
  if (createBtn) {
    createBtn.addEventListener('click', async () => {
      const codeInput = document.getElementById('newPromoCode').value.trim().toUpperCase();
      const typeInput = document.getElementById('newPromoType').value;
      const valueInput = Number(document.getElementById('newPromoValue').value);
      const maxUsesInput = Number(document.getElementById('newPromoMaxUses').value);
      const msg = document.getElementById('adminPromoMessage');

      if (!codeInput || isNaN(valueInput) || valueInput <= 0) {
        msg.style.color = "#ef4444";
        msg.textContent = "Please enter a valid code and a non-zero value.";
        return;
      }

      try {
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
        
        document.getElementById('newPromoCode').value = '';
        document.getElementById('newPromoValue').value = '';
        loadDashboardData();
      } catch (err) {
        console.error("Error creating promo code:", err);
        msg.style.color = "#ef4444";
        msg.textContent = "Crash: " + (err.message || JSON.stringify(err) || err);
      }
    });
  }

  // Autocomplete Setup
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

      const matches = window.allUsers.filter(u => {
        const nameMatch = u.name && u.name.toLowerCase().includes(query);
        const emailMatch = u.email && u.email.toLowerCase().includes(query);
        return nameMatch || emailMatch;
      });

      if (matches.length === 0) {
        listElem.classList.remove('active');
        return;
      }

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

  document.addEventListener('click', function(e) {
    if (!e.target.closest('#emailTab')) {
      if (nameList) nameList.classList.remove('active');
      if (emailList) emailList.classList.remove('active');
    }
  });
});

// Modal Handlers
window.openEditModal = function(code, type, val, maxUses) {
  document.getElementById("editModalCodeTitle").innerText = code;
  document.getElementById("editModalCode").value = code;
  document.getElementById("editModalType").value = type;
  document.getElementById("editModalValue").value = val;
  document.getElementById("editModalMaxUses").value = maxUses;
  document.getElementById("editModal").style.display = "flex";
};

window.closeEditModal = function() {
  document.getElementById("editModal").style.display = "none";
};

window.savePromoEdit = async function() {
  const code = document.getElementById("editModalCode").value;
  const type = document.getElementById("editModalType").value;
  const val = Number(document.getElementById("editModalValue").value);
  const maxUses = Number(document.getElementById("editModalMaxUses").value);

  try {
    await updateDoc(doc(db, "promocodes", code), {
      type: type,
      value: val,
      maxUses: maxUses
    });
    alert(`Updated ${code}`);
    window.closeEditModal();
    loadDashboardData();
  } catch (err) {
    alert("Update error: " + err.message);
  }
};

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
