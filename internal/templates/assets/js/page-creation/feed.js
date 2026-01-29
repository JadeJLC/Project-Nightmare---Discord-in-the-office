// Fonction pour la création de la page "derniers messages"

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

    feedContainer.innerHTML = `<hr/><h2 class="feed-title">Derniers messages postés sur le forum</h2>`;

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

  const topicID = String(topic.topic_id).padStart(2, "0");
  const postID = String(topic.post_id).padStart(2, "0");

  let message = topic.content.slice(0, 100);
  if (topic.content.length >= 100) message += "...";

  if (topic.topic_title === "Aucun message") {
    topicBloc.className = "feed-notopic";
    topicBloc.innerHTML = `<img src="/assets/icons/notopic.png"/> Aucun sujet correspondant à votre recherche n'a été trouvé`;
  } else {
    topicBloc.innerHTML = `<button type="button" class="button-link" style="float:right;padding-top:10px">
                  <img
                    src="assets/images/external-link.svg"
                    alt="Voir le message"
                    title="Voir le message"
                  />
                </button>
                <h3 id="topic_${topicID}#post_${postID}">Sujet : ${topic.topic_title}</h3> 
 <div class="topic-content">   
    <div class="topic-lastpost">${message} </div>
    <div class="topic-lastinfo">posté le ${topic.created_on} par ${topic.author}</div>
 </div>`;
  }

  return topicBloc;
}

export { displayFeed };
