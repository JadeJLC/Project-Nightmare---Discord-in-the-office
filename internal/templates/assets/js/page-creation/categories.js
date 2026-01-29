// Fonctions pour la création de la page d'accueil avec toutes les catégories du forum

async function displayCategories() {
  try {
    const response = await fetch("/?mode=categ");
    const catList = await response.json();

    const frontPageContainer = document.getElementById("front-page");
    let categoriesContainer = document.getElementById("categories");

    if (!categoriesContainer) {
      categoriesContainer = document.createElement("div");
      categoriesContainer.id = "categories";
      frontPageContainer.appendChild(categoriesContainer);
    }
    categoriesContainer.innerHTML = "";

    catList.forEach((category) => {
      const catBloc = buildCategory(category);
      categoriesContainer.appendChild(catBloc);
    });

    let feedContainer = document.getElementById("feed");
    if (feedContainer) feedContainer.remove();
  } catch (error) {
    console.log("Erreur dans la récupération des catégories : ", error);
  }
}

function buildCategory(category) {
  const catBloc = document.createElement("div");
  catBloc.className = "cat-bloc";

  const catID = String(category.id).padStart(2, "0");

  const image = `assets/icons/cat_${catID}.png`;
  const lastpost = category.lastpost;

  let lastPostHTML;
  if (lastpost.topic_title === "Aucun message pour le moment") {
    lastPostHTML = `<div class="cat-lastpost"><center>${lastpost.topic_title}</center></div>`;
  } else {
    lastPostHTML = `<div class="cat-lastpost"><button type="button" class="button-link link-right">
                  <img
                    src="assets/images/external-link.svg"
                    alt="Voir le message"
                    title="Voir le message"
                  />
                </button>
                <center>Dernier message</center>
    <div class="last-post-title">
 ${lastpost.topic_title} </div>
    <div class="last-post-date">• le ${lastpost.created_on} par ${lastpost.author}</div>
    </div>`;
  }

  catBloc.innerHTML = `<h3 id="cat_${catID}">${category.name}</h3>
 <div class="cat-content">   
    <div class="cat-description">${category.description}</div>
    <div class="cat-image"><img src="${image}"/></div>
    ${lastPostHTML}
 </div>`;

  return catBloc;
}

export { displayCategories };
