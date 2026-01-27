// Fonctions pour la création de la page d'accueil avec toutes les catégories du forum

function getCategories() {
  // Récupération des catégories dans la base de données

  const catList = [
    {
      cat_id: 0,
      name: "Règles et explications",
      description:
        "Toute communauté se doit d'avoir quelques règles pour la bonne entente et l'organisation. Vous pouvez consulter ici celles de Project Nightmare : Discord in the Office. Vous y trouverez aussi des informations sur la licence Project Nigthmare.",
      lastpost: "Aucun message pour le moment",
      image: "assets/images/cat_01.png",
    },
  ];

  return catList;
}

function displayCategories() {
  const catList = getCategories();
  let categoriesContainer = document.getElementById("categories");

  if (!categoriesContainer) {
    let addedContainer = `<div id="categories"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
    categoriesContainer = document.getElementById("categories");
  }
  categoriesContainer.innerHTML = "";

  catList.forEach((category) => {
    const catBloc = buildCategory(category);
    categoriesContainer.appendChild(catBloc);
  });

  let feedContainer = document.getElementById("feed");
  if (feedContainer) feedContainer.remove();
}

function buildCategory(category) {
  const catBloc = document.createElement("div");
  catBloc.className = "cat-bloc";

  catBloc.innerHTML = `<h3 id="cat_${category.cat_id}">${category.name}</h3>
 <div class="cat-content">   
    <div class="cat-description">${category.description}</div>
    <div class="cat-image"><img src="${category.image}"/></div>
    <div class="cat-lastpost">${category.lastpost}</div>
 </div>`;

  return catBloc;
}

export { displayCategories };
