function soundEffect(soundName) {
  const effectPath = selectMusic(`sound-effects/${soundName}`);
  const audioBox = document.getElementById("game-screen");
  const audio = document.createElement("audio");

  audio.src = effectPath;
  audio.loop = false;

  audioBox.append(audio);
  audio.play();

  if (soundName == "shoot") {
    setTimeout(() => {
      audio.pause();
    }, 500);
  }

  setTimeout(() => {
    audio.remove();
  }, 3000);
}

export { soundEffect };
