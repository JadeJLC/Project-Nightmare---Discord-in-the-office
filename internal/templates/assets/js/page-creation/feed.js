// Fonction pour la création de la page "derniers messages"
function getLastPosts() {
  // Récupération des messages dans la base de données

  const topicList = [
    {
      topic_id: 0,
      cat_id: 0,
      title: "Règles du forum",
      created_on: "01/01/2026",
      last_message: "Dernier message posté sur ce sujet",
      last_author: "Test1",
    },
    {
      topic_id: 1,
      cat_id: 0,
      title: "A propos de la licence",
      created_on: "01/01/2026",
      last_message: "Dernier message posté sur ce sujet",
      last_author: "Test1",
    },
  ];

  return topicList;
}

async function displayFeed() {
  try {
    const response = await fetch("/?mode=feed");
    const topicList = await response.json();

    let feedContainer = document.getElementById("feed");
    const frontPageContainer = document.getElementById("front-page");

    if (!feedContainer) {
      feedContainer = document.createElement("div");
      feedContainer.id = "feed";
      frontPageContainer.appendChild(feedContainer);
    }

    feedContainer.innerHTML = `<h2 class="feed-title">Derniers messages postés sur le forum</h2>`;

    topicList.forEach((topic) => {
      const topicBloc = buildTopic(topic);
      feedContainer.appendChild(topicBloc);
    });

    let categoriesContainer = document.getElementById("categories");
    if (categoriesContainer) categoriesContainer.remove();
  } catch (error) {
    console.log("Erreur dans la récupération du feed : ", error);
  }
}

function buildTopic(topic) {
  const topicBloc = document.createElement("div");
  topicBloc.className = "topic-bloc";

  let message = topic.last_message.slice(0, 100);
  if (topic.last_message.length >= 100) message += "...";

  topicBloc.innerHTML = `<h3 id="topic_${topic.topic_id}">Sujet : ${topic.title}</h3>
 <div class="topic-content">   
    <div class="topic-lastpost">${message}</div>
    <div class="topic-lastinfo">posté le ${topic.created_on} par ${topic.last_author}</div>
 </div>`;

  return topicBloc;
}

export { displayFeed };
