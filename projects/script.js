const projectContainer = document.getElementById("projects-container");
const searchInput = document.getElementById("search");
const filterInputs = document.querySelectorAll(
  "#filters input[type='checkbox']"
);
const paginationContainer = document.getElementById("pagination");

let allProjects = [];
let currentPage = 1;
const perPage = 6;

fetch("projects.json")
  .then((res) => res.json())
  .then((data) => {
    allProjects = data;
    const params = new URLSearchParams(window.location.search);
    const filterByLinkFM = params.get("linkFM") === "true";

    if (filterByLinkFM) {
      const fmCheckbox = document.getElementById("filter-fm");
      if (fmCheckbox) {
        fmCheckbox.checked = true;
      }
    }
    renderProjects();
  });

function renderProjects() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedTags = Array.from(filterInputs)
    .filter((input) => input.checked)
    .map((input) => input.value);

  let filtered = allProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm);

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => {
        if (tag === "fm") {
          return project.linkFM && project.linkFM.trim() !== "";
        }
        return project.tags.includes(tag);
      });

    return matchesSearch && matchesTags;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (currentPage - 1) * perPage;
  const visible = filtered.slice(start, start + perPage);

  projectContainer.innerHTML = visible
    .map(
      (project) => `
      <div class="project-card">
        <img src="${project.image}" alt="${project.title}">
        <h3>${project.title}</h3>
        <p class="card__desc">${project.description}</p>
        <ul class="tags">
           ${project.tags
             .map((tag) => `<li class="tag__item">${tag.trim()}</li>`)
             .join("")}
        </ul>
        <ul class="links">
             ${
               project.githubUrl
                 ? `<a href="${project.githubUrl}" target="_blank">GitHub</a>`
                 : ""
             }
          ${
            project.url
              ? `<a href="${project.url}" target="_blank">Live Demo</a>`
              : ""
          }
          ${
            project.linkFM
              ? `<a href="${project.linkFM}" target="_blank">FM Page</a>`
              : ""
          }
        </ul>
      </div>
    `
    )
    .join("");

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "page-btn" + (i === currentPage ? " active" : "");
    btn.onclick = () => {
      currentPage = i;
      renderProjects();
    };
    paginationContainer.appendChild(btn);
  }
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderProjects();
});
filterInputs.forEach((input) =>
  input.addEventListener("change", () => {
    currentPage = 1;
    renderProjects();
  })
);
