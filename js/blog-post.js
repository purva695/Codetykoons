const API_BASE = "https://codetykoons.onrender.com/api";
const slug = new URLSearchParams(location.search).get("slug");

function escapeHtml(value="") {
  return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function formatContent(text="") {
  return text.split(/\n{2,}/).map(block => {
    const clean = escapeHtml(block).replace(/\n/g, "<br>");
    return `<p>${clean}</p>`;
  }).join("");
}

async function loadPost() {
  const root = document.getElementById("postRoot");
  if (!slug) {
    root.innerHTML = `<div class="empty">Blog not found.</div>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/blogs/published/${encodeURIComponent(slug)}`);
    const blog = await res.json();
    if (!res.ok) throw new Error(blog.message || "Not found");

    root.innerHTML = `
      <article class="post">
        <div class="meta">${escapeHtml(blog.category)} · ${escapeHtml(blog.author)} · ${new Date(blog.createdAt).toLocaleDateString()}</div>
        <h1>${escapeHtml(blog.title)}</h1>
        <div class="post-desc">${escapeHtml(blog.short_description || "")}</div>
        ${blog.image ? `<img class="post-image" src="${API_BASE.replace("/api","")}${blog.image}" alt="${escapeHtml(blog.title)}">` : ""}
        <div class="post-content">${formatContent(blog.content)}</div>
      </article>
    `;
    document.title = `${blog.title} | CodeTykoons`;
  } catch (error) {
    root.innerHTML = `<div class="empty">This blog could not be loaded.</div>`;
    console.error(error);
  }
}
loadPost();
