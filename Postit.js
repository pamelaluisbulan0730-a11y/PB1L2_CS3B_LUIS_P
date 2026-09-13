/* ==============================================
   postit.js
   Handles:
   1) Collecting the user's info ONE TIME (no signup/login system)
   2) Letting the user create caption-only posts
   3) Encrypting (Username + Post + Date) with AES-192 using CryptoJS
   4) Rendering the "ORIGINAL POST" + "ENCRYPTED" thread
   ============================================== */

const SECRET_KEY = "PB1L2-CS3B-Secret-Key";
const AES_OPTIONS = { keySize: 192 / 32 };

const infoSection = document.getElementById("infoSection");
const postSection = document.getElementById("postSection");
const infoForm = document.getElementById("infoForm");
const backBtn = document.getElementById("backBtn");
const postBtn = document.getElementById("postBtn");
const captionInput = document.getElementById("caption");
const postsList = document.getElementById("postsList");

let posts = [];

function showInfoSection() {
  infoSection.classList.remove("hidden");
  postSection.classList.add("hidden");
}

function showPostSection() {
  infoSection.classList.add("hidden");
  postSection.classList.remove("hidden");
}

function getFormattedDate() {
  const now = new Date();
  return now.toLocaleString();
}

function encryptPost(username, caption, date) {
  const payload = JSON.stringify({
    username: username,
    post: caption,
    date: date
  });
  const encrypted = CryptoJS.AES.encrypt(payload, SECRET_KEY, AES_OPTIONS);
  return encrypted.toString();
}

function renderPosts() {
  if (posts.length === 0) {
    postsList.innerHTML = '<p class="emptyMsg">No posts yet. Still waiting networks!</p>';
    return;
  }

  let html = "";
  for (let i = posts.length - 1; i >= 0; i--) {
    const p = posts[i];
    html += `
      <div class="postCard">
        <span class="postLabel">ORIGINAL POST</span>
        <p class="originalText">${escapeHtml(p.caption)}</p>
        <span class="postLabel">ENCRYPTED</span>
        <p class="encryptedText">${p.encrypted}</p>
      </div>
    `;
  }
  postsList.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

infoForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const userInfo = {
    fullName: document.getElementById("fullName").value.trim(),
    dob: document.getElementById("dob").value,
    yearLevel: document.getElementById("yearLevel").value,
    gender: document.getElementById("gender").value,
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value
  };

  sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
  showPostSection();
});

backBtn.addEventListener("click", function () {
  const saved = JSON.parse(sessionStorage.getItem("userInfo"));
  if (saved) {
    document.getElementById("fullName").value = saved.fullName;
    document.getElementById("dob").value = saved.dob;
    document.getElementById("yearLevel").value = saved.yearLevel;
    document.getElementById("gender").value = saved.gender;
    document.getElementById("username").value = saved.username;
    document.getElementById("password").value = saved.password;
  }
  showInfoSection();
});

postBtn.addEventListener("click", function () {
  const caption = captionInput.value.trim();
  if (caption === "") {
    alert("Please write a caption before posting.");
    return;
  }

  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const date = getFormattedDate();
  const encrypted = encryptPost(userInfo.username, caption, date);

  posts.push({ caption: caption, encrypted: encrypted });
  sessionStorage.setItem("posts", JSON.stringify(posts));

  captionInput.value = "";
  renderPosts();
});

window.addEventListener("DOMContentLoaded", function () {
  const savedInfo = sessionStorage.getItem("userInfo");
  const savedPosts = sessionStorage.getItem("posts");

  if (savedPosts) {
    posts = JSON.parse(savedPosts);
  }

  if (savedInfo) {
    showPostSection();
    renderPosts();
  } else {
    showInfoSection();
  }
});
