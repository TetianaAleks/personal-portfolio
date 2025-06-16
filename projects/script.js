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
    const filterByFreeCodeCamp = params.get("freeCodeCamp") === "true";

    if (filterByLinkFM) {
      const fmCheckbox = document.getElementById("filter-fm");
      if (fmCheckbox) {
        fmCheckbox.checked = true;
        updateActiveFiltersCount();
      }
    }
    if (filterByFreeCodeCamp) {
      const ffcCheckbox = document.getElementById("filter-freeCodeCamp");
      if (ffcCheckbox) {
        ffcCheckbox.checked = true;
        updateActiveFiltersCount();
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
        if (tag === "freeCodeCamp") {
          return project.freeCodeCamp && project.freeCodeCamp === true;
        }
        return project.tags.includes(tag);
      });

    return matchesSearch && matchesTags;
  });

  if (filtered.length === 0) {
    projectContainer.innerHTML = `
      <div class="no-results">
        There are no projects matching your filters or search.
      </div>`;
    paginationContainer.innerHTML = "";
    return;
  }

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

  const createPageButton = (pageNum) => {
    const btn = document.createElement("button");
    btn.textContent = pageNum;
    btn.className = "page-btn" + (pageNum === currentPage ? " active" : "");
    btn.onclick = () => {
      currentPage = pageNum;
      renderProjects();
    };
    paginationContainer.appendChild(btn);
  };

  const createDots = () => {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.className = "pagination-dots";
    paginationContainer.appendChild(dots);
  };

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "←";
  prevBtn.className = "page-btn nav-btn";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderProjects();
    }
  };
  paginationContainer.appendChild(prevBtn);

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) createPageButton(i);
  } else {
    createPageButton(1);

    if (currentPage > 3) createDots();

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      createPageButton(i);
    }

    if (currentPage < totalPages - 2) createDots();

    createPageButton(totalPages);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "→";
  nextBtn.className = "page-btn nav-btn";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProjects();
    }
  };
  paginationContainer.appendChild(nextBtn);
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderProjects();
});
filterInputs.forEach((input) =>
  input.addEventListener("change", () => {
    updateActiveFiltersCount();
    currentPage = 1;
    renderProjects();
  })
);

const openFiltersBtn = document.getElementById("open-filters-btn");
const filterPanel = document.getElementById("filter-panel");

openFiltersBtn.addEventListener("click", () => {
  filterPanel.classList.remove("hidden");
});

function closeFilterPanel() {
  document.getElementById("filter-panel").classList.add("hidden");
}

function resetFilters() {
  filterInputs.forEach((input) => (input.checked = false));
  currentPage = 1;
  renderProjects();
  updateActiveFiltersCount();
}

const activeFiltersCountSpan = document.getElementById("active-filters-count");

function updateActiveFiltersCount() {
  const activeCount = Array.from(filterInputs).filter(
    (input) => input.checked
  ).length;
  activeFiltersCountSpan.textContent =
    activeCount > 0 ? `(${activeCount})` : "";
}

document.addEventListener("click", (e) => {
  const isClickInsidePanel = filterPanel.contains(e.target);
  const isClickOnToggleBtn = openFiltersBtn.contains(e.target);

  if (!isClickInsidePanel && !isClickOnToggleBtn) {
    filterPanel.classList.add("hidden");
  }
});
