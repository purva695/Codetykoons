const API_BASE = "https://codetykoons.onrender.com/api";

function escapeHtml(value = "") {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );
}

async function loadBlogs() {
  const grid = document.getElementById("blogGrid");
  try {
    const res = await fetch(`${API_BASE}/blogs/published`);
    const blogs = await res.json();
    if (!res.ok) throw new Error(blogs.message || "Could not load blogs.");

    if (!blogs.length) {
      grid.innerHTML = `<div class="empty">No published blogs yet.</div>`;
      return;
    }

    grid.innerHTML = blogs
      .map(
        (blog) => `
      <article class="blog-card">
        <div class="blog-image">
          ${blog.image ? `<img src="${API_BASE.replace("/api", "")}${blog.image}" alt="${escapeHtml(blog.title)}">` : ""}
        </div>
        <div class="blog-body">
        <div class="meta">
          ${escapeHtml(blog.category)} ·
          ${blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ""}
        </div>          
        <h2>${escapeHtml(blog.title)}</h2>
          <p>${escapeHtml(blog.short_description || "")}</p>
          <a class="read-more" href="blog-post.html?slug=${encodeURIComponent(blog.slug)}">Read More →</a>
        </div>
      </article>
    `,
      )
      .join("");
  } catch (error) {
    grid.innerHTML = `<div class="empty">Blog service is not connected yet. Start the backend and refresh this page.</div>`;
    console.error(error);
  }
}
loadBlogs();
