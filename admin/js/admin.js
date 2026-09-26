const API = "http://localhost:5000/api";

let token =
  localStorage.getItem("codetykoons_admin_token") || "";

let editingId = null;

const $ = id =>
  document.getElementById(id);


/* =========================================
   AUTH HEADERS
========================================= */

function authHeaders() {

  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};

}


/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(page) {

  document
    .querySelectorAll(".page")
    .forEach(el =>
      el.classList.add("hidden")
    );

  $(page + "Page")
    .classList.remove("hidden");


  document
    .querySelectorAll(".nav-item")
    .forEach(el =>
      el.classList.remove("active")
    );


  const nav =
    document.querySelector(
      `.nav-item[data-page="${page}"]`
    );


  if (nav) {
    nav.classList.add("active");
  }


  $(
    "pageTitle"
  ).textContent =
    page === "editor"
      ? (
          editingId
            ? "Edit Blog"
            : "Add Blog"
        )
      : page.charAt(0).toUpperCase()
        + page.slice(1);

}


/* =========================================
   API REQUEST
========================================= */

async function request(
  url,
  options = {}
) {

  const res =
    await fetch(
      `${API}${url}`,
      {
        ...options,

        headers: {
          ...authHeaders(),
          ...(options.headers || {})
        }
      }
    );


  const data =
    await res
      .json()
      .catch(() => ({}));


  if (res.status === 401) {

    logout();

    throw new Error(
      "Session expired."
    );

  }


  if (!res.ok) {

    throw new Error(
      data.message ||
      "Request failed."
    );

  }


  return data;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value = "") {

  return String(value).replace(
    /[&<>"']/g,

    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c])
  );

}


/* =========================================
   BLOG ROW
========================================= */

function rowHtml(blog) {

  const date =
    blog.createdAt
      ? new Date(
          blog.createdAt
        ).toLocaleDateString()
      : "";


  return `
    <div class="blog-row">

      <div>

        <div class="blog-title">
          ${escapeHtml(blog.title)}
        </div>

        <div class="blog-sub">
          ${escapeHtml(blog.category)}
          ·
          ${date}
        </div>

      </div>


      <div>

        <span class="badge ${blog.status}">
          ${escapeHtml(blog.status)}
        </span>

      </div>


      <div>
        ${escapeHtml(blog.author)}
      </div>


      <div class="actions">

        <button
          class="small-btn blue"
          onclick="editBlog('${blog._id}')"
        >
          Edit
        </button>


        <button
          class="small-btn"
          onclick="toggleBlog('${blog._id}')"
        >
          ${
            blog.status === "published"
              ? "Unpublish"
              : "Publish"
          }
        </button>


        <button
          class="small-btn danger"
          onclick="deleteBlog('${blog._id}')"
        >
          Delete
        </button>

      </div>

    </div>
  `;

}


/* =========================================
   LOAD BLOGS
========================================= */

async function loadBlogs() {

  const blogs =
    await request("/blogs");


  const published =
    blogs.filter(
      blog =>
        blog.status === "published"
    ).length;


  $("totalCount").textContent =
    blogs.length;


  $("publishedCount").textContent =
    published;


  $("draftCount").textContent =
    blogs.length - published;


  $("recentBlogs").innerHTML =
    blogs.length

      ? blogs
          .slice(0, 5)
          .map(rowHtml)
          .join("")

      : `
          <div class="loading">
            No blogs yet.
          </div>
        `;


  $("allBlogs").innerHTML =
    blogs.length

      ? blogs
          .map(rowHtml)
          .join("")

      : `
          <div class="loading">
            No blogs yet.
          </div>
        `;

}


/* =========================================
   RESET BLOG FORM
========================================= */

function resetForm() {

  editingId = null;

  $("blogForm").reset();

  $("blogId").value = "";

  $("existingImage").value = "";

  $("category").value =
    "Technology";

  $("author").value =
    "CodeTykoons";

  $("status").value =
    "draft";

  $("editorTitle").textContent =
    "Add Blog";

  $("formMessage").textContent =
    "";

  $("imagePreview").innerHTML =
    "";

  showPage("editor");

}


/* =========================================
   EDIT BLOG
========================================= */

async function editBlog(id) {

  const blog =
    await request(
      `/blogs/${id}`
    );


  editingId = id;


  $("blogId").value =
    id;


  $("title").value =
    blog.title || "";


  $("category").value =
    blog.category || "Technology";


  $("author").value =
    blog.author || "CodeTykoons";


  $("status").value =
    blog.status || "draft";


  $("shortDescription").value =
    blog.short_description || "";


  $("content").value =
    blog.content || "";


  $("existingImage").value =
    blog.image || "";


  $("editorTitle").textContent =
    "Edit Blog";


  $("formMessage").textContent =
    "";


  $("imagePreview").innerHTML =
    blog.image

      ? `
          <img
            src="http://localhost:5000${blog.image}"
            alt="Blog image"
          >
        `

      : "";


  showPage("editor");

}


/* =========================================
   TOGGLE BLOG STATUS
========================================= */

async function toggleBlog(id) {

  if (
    !confirm(
      "Change this blog's publish status?"
    )
  ) {
    return;
  }


  await request(
    `/blogs/${id}/toggle-status`,
    {
      method: "PATCH"
    }
  );


  await loadBlogs();

}


/* =========================================
   DELETE BLOG
========================================= */

async function deleteBlog(id) {

  if (
    !confirm(
      "Delete this blog permanently?"
    )
  ) {
    return;
  }


  await request(
    `/blogs/${id}`,
    {
      method: "DELETE"
    }
  );


  await loadBlogs();

}


/* =========================================
   LOGOUT
========================================= */

function logout() {

  token = "";

  localStorage.removeItem(
    "codetykoons_admin_token"
  );


  $("appView")
    .classList.add("hidden");


  $("loginView")
    .classList.remove("hidden");

}


/* =========================================
   PASSWORD EYE TOGGLE
========================================= */

const passwordToggle =
  $("passwordToggle");

const loginPassword =
  $("loginPassword");

const eyeOpen =
  $("eyeOpen");

const eyeOff =
  $("eyeOff");


passwordToggle.addEventListener(
  "click",
  () => {

    const isPassword =
      loginPassword.type === "password";


    if (isPassword) {

      /* Show password */

      loginPassword.type =
        "text";


      eyeOpen.classList.add(
        "hidden"
      );


      eyeOff.classList.remove(
        "hidden"
      );


      passwordToggle.setAttribute(
        "aria-label",
        "Hide password"
      );


      passwordToggle.setAttribute(
        "title",
        "Hide password"
      );

    } else {

      /* Hide password */

      loginPassword.type =
        "password";


      eyeOff.classList.add(
        "hidden"
      );


      eyeOpen.classList.remove(
        "hidden"
      );


      passwordToggle.setAttribute(
        "aria-label",
        "Show password"
      );


      passwordToggle.setAttribute(
        "title",
        "Show password"
      );

    }

  }
);


/* =========================================
   LOGIN
========================================= */

$("loginForm")
  .addEventListener(
    "submit",
    async e => {

      e.preventDefault();


      $("loginMessage")
        .textContent = "";


      try {

        const data =
          await request(
            "/auth/login",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  email:
                    $("loginEmail").value,

                  password:
                    $("loginPassword").value
                })
            }
          );


        token =
          data.token;


        localStorage.setItem(
          "codetykoons_admin_token",
          token
        );


        $("loginView")
          .classList.add("hidden");


        $("appView")
          .classList.remove("hidden");


        await loadBlogs();

      } catch (err) {

        $("loginMessage")
          .textContent =
            err.message;

      }

    }
  );


/* =========================================
   SAVE BLOG
========================================= */

$("blogForm")
  .addEventListener(
    "submit",
    async e => {

      e.preventDefault();


      $("formMessage")
        .textContent = "";


      $("saveBtn")
        .disabled = true;


      try {

        const form =
          new FormData();


        form.append(
          "title",
          $("title").value
        );


        form.append(
          "category",
          $("category").value
        );


        form.append(
          "author",
          $("author").value
        );


        form.append(
          "status",
          $("status").value
        );


        form.append(
          "short_description",
          $("shortDescription").value
        );


        form.append(
          "content",
          $("content").value
        );


        form.append(
          "existing_image",
          $("existingImage").value
        );


        if (
          $("image").files[0]
        ) {

          form.append(
            "image",
            $("image").files[0]
          );

        }


        const url =
          editingId

            ? `/blogs/${editingId}`

            : "/blogs";


        await request(
          url,
          {
            method:
              editingId
                ? "PUT"
                : "POST",

            body: form
          }
        );


        $("formMessage")
          .style.color =
            "#157342";


        $("formMessage")
          .textContent =
            "Blog saved successfully.";


        await loadBlogs();


        setTimeout(
          () =>
            showPage("blogs"),
          400
        );


      } catch (err) {

        $("formMessage")
          .style.color =
            "#c73d4b";


        $("formMessage")
          .textContent =
            err.message;


      } finally {

        $("saveBtn")
          .disabled = false;

      }

    }
  );


/* =========================================
   IMAGE PREVIEW
========================================= */

$("image")
  .addEventListener(
    "change",
    () => {

      const file =
        $("image").files[0];


      if (!file) {
        return;
      }


      const url =
        URL.createObjectURL(file);


      $("imagePreview")
        .innerHTML = `
          <img
            src="${url}"
            alt="Preview"
          >
        `;

    }
  );


/* =========================================
   NAVIGATION BUTTONS
========================================= */

document
  .querySelectorAll("[data-page]")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        const page =
          btn.dataset.page;


        if (
          page === "editor"
        ) {

          resetForm();

        } else {

          showPage(page);

        }

      }
    );

  });


/* =========================================
   BUTTON EVENTS
========================================= */

$("topAdd").onclick =
  resetForm;


$("listAdd").onclick =
  resetForm;


$("cancelEdit").onclick =
  () =>
    showPage("blogs");


$("logoutBtn").onclick =
  logout;


/* =========================================
   AUTO LOGIN USING SAVED TOKEN
========================================= */

if (token) {

  $("loginView")
    .classList.add("hidden");


  $("appView")
    .classList.remove("hidden");


  loadBlogs()
    .catch(() => {});

}