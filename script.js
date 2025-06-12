const projectContainer = document.getElementById("projects-container");

let allProjects = [];

fetch("./projects/projects.json")
  .then((res) => res.json())
  .then((data) => {
    allProjects = data.slice(0, 6);
    renderProjects();
  });

function renderProjects() {
  projectContainer.innerHTML = allProjects
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
}

document
  .getElementById("contact-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const statusEl = document.getElementById("status");

    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mqaqavol", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        statusEl.innerText = "✅ Your message has been sent successfully!";
        statusEl.className = "success";
        form.reset();
      } else {
        statusEl.innerText =
          "❌ Oops, something went wrong. Please try again later.";
        statusEl.className = "error";
      }
    } catch (error) {
      statusEl.innerText = "⚠️ Error: " + error.message;
      statusEl.className = "warning";
    }
  });
