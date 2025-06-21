const apiBase = "https://disaster-relief-management.onrender.com/api";

// Create Disaster
document
  .getElementById("disasterForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const disaster = {
      title: form.title.value,
      locationName: form.location_name.value,
      description: form.description.value,
      tags: form.tags.value.split(",").map((tag) => tag.trim()),
      lat: form.lat.value,
      lon: form.lon.value,
    };

    await fetch(`${apiBase}/disasters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(disaster),
    });

    form.reset();
    // loadDisasters();
  });

async function loadDisasters() {
  const res = await fetch(`${apiBase}/disasters`);
  const data = await res.json();

  const list = document.getElementById("disasterList");
  list.innerHTML = "";
  data.forEach((d) => {
    console.log(d);
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${d.title}</strong> — ${d.description}
      <br/>
      <button onclick="deleteDisaster('${d.id}')">🗑️ Delete</button>
      <button onclick="showUpdateForm('${d.id}', '${d.title}', '${d.description}')">✏️ Edit</button>
      <button onclick="loadSocialMedia('${d.id}')">👁️ View social</button>
      <button onclick="loadResources('${d.id}')">🛖 View resources</button>
    `;
    list.appendChild(li);
  });
}

async function loadSocialMedia(disasterId) {
  const res = await fetch(`${apiBase}/disasters/${disasterId}/social-media`);
  const posts = await res.json();

  const feed = document.getElementById("socialMediaFeed");
  feed.innerHTML = "";
  const socialHeader = document.getElementById("socialHeader");
  socialHeader.style.display = "block";
  if (!posts.length) {
    feed.textContent = "No social media posts found.";
    return;
  }

  posts.forEach((post) => {
    const p = document.createElement("div");
    p.textContent = `${post.user || "unknown"}: ${post.content || "no update"}`;
    feed.appendChild(p);
  });
}

async function loadResources(disasterId) {
  const res = await fetch(`${apiBase}/disasters/${disasterId}/resource`);
  const resources = await res.json();

  const feed = document.getElementById("resourceFeed");
  feed.innerHTML = "";
  const socialHeader = document.getElementById("resourceHeader");
  socialHeader.style.display = "block";
  if (!resources.length) {
    feed.textContent = "No resources found.";
    return;
  }

  resources.forEach((resource) => {
    const p = document.createElement("div");
    p.textContent = `${resource.name || "unknown"} ( ${
      resource.type || "unknown"
    } ) : lat - ${resource.lat || "nearby"} , lon - ${
      resource.lon || "nearby"
    } `;
    feed.appendChild(p);
  });
}

const socket = io("https://disaster-relief-management.onrender.com/");

socket.on("connect", () => console.log("🔌 Still connected"));

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});
socket.on("disaster_updated", (msg) => {
  console.log(msg);

  const { type, payload } = msg;
  let text = "";

  if (type === "create") {
    text = `🆕 Created — ${payload.title}`;
  } else if (type === "update") {
    text = `✏️ Updated — ${payload.title}`;
  } else if (type === "delete") {
    text = `🗑️ Deleted — ID: ${payload.id}`;
  }
  loadDisasters();
  const header = document.getElementById("liveDisasterHeader");
  header.style.display = "block";

  const liveFeed = document.getElementById("liveFeed");
  console.log("Live feed div:", document.getElementById("liveFeed"));

  const el = document.createElement("div");
  el.textContent = `🔄 ${text}`;
  liveFeed.prepend(el);
});

function showUpdateForm(id, title, description) {
  const form = document.getElementById("updateForm");
  form.style.display = "block";

  const header = document.getElementById("updateFormHeader");
  header.style.display = "block";

  form.id.value = id;
  form.title.value = title;
  form.description.value = description;
}

document.getElementById("updateForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const id = form.id.value;

  const updated = {
    title: form.title.value,
    description: form.description.value,
  };

  await fetch(`${apiBase}/disasters/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });

  form.reset();
  form.style.display = "none";
});

async function deleteDisaster(id) {
  await fetch(`${apiBase}/disasters/${id}`, { method: "DELETE" });
}

loadDisasters();
