const gameListEl = document.getElementById("gamesList");
const password = "548918";

// === Restore background from localStorage on load ===
window.addEventListener("load", () => {
  const savedBg = localStorage.getItem("skz_bg");
  if (savedBg) {
    document.body.classList.add("bg-" + savedBg);
    document.getElementById("bgSelect").value = savedBg;
  }

  // Load games
  const savedGames = JSON.parse(localStorage.getItem("skz_games")) || [];
  savedGames.forEach(game => renderGameCard(game));
});

// === Background Selector Logic ===
document.getElementById("bgSelect").addEventListener("change", function () {
  const selected = this.value;

  // Remove existing bg- classes
  document.body.classList.forEach(cls => {
    if (cls.startsWith("bg-")) document.body.classList.remove(cls);
  });

  document.body.classList.add("bg-" + selected);
  localStorage.setItem("skz_bg", selected);
});

// === Upload Game ===
document.getElementById("uploadBtn").addEventListener("click", () => {
  const htmlFile = document.getElementById("htmlFile").files[0];
  const cssFile = document.getElementById("cssFile").files[0];
  const jsFile = document.getElementById("jsFile").files[0];
  const thumbnail = document.getElementById("thumbnailFile").files[0];

  if (!htmlFile || !cssFile || !jsFile || !thumbnail) {
    alert("Please upload all required files!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const htmlContent = e.target.result;

    const cssReader = new FileReader();
    cssReader.onload = function (ce) {
      const cssContent = ce.target.result;

      const jsReader = new FileReader();
      jsReader.onload = function (je) {
        const jsContent = je.target.result;

        const thumbReader = new FileReader();
        thumbReader.onload = function (te) {
          const thumbnailUrl = te.target.result;

          const gameData = {
            html: htmlContent,
            css: cssContent,
            js: jsContent,
            thumbnail: thumbnailUrl
          };

          saveGameToStorage(gameData);
          renderGameCard(gameData);
        };
        thumbReader.readAsDataURL(thumbnail);
      };
      jsReader.readAsText(jsFile);
    };
    cssReader.readAsText(cssFile);
  };
  reader.readAsText(htmlFile);
});

// === Save Game to localStorage ===
function saveGameToStorage(game) {
  const existing = JSON.parse(localStorage.getItem("skz_games")) || [];
  existing.push(game);
  localStorage.setItem("skz_games", JSON.stringify(existing));
}

// === Render Game Card ===
function renderGameCard(gameData) {
  const gameFrame = `
    <style>${gameData.css}</style>
    ${gameData.html}
    <script>${gameData.js}<\/script>
  `;

  const gameCard = document.createElement("div");
  gameCard.className = "game-card";
  gameCard.innerHTML = `
    <img src="${gameData.thumbnail}" alt="Game Thumbnail">
    <div class="game-card-controls">
      <button onclick="previewGame(this)">▶️ Play</button>
      <div class="menu-wrapper">
        <button class="menu-btn">⋮</button>
        <div class="menu-dropdown">
          <button onclick="removeGame(this)">🗑️ Remove</button>
        </div>
      </div>
    </div>
    <div class="game-content" style="display:none;">${gameFrame}</div>
  `;

  gameListEl.appendChild(gameCard);
}

// === Play Game ===
function previewGame(button) {
  const gameHTML = button.closest(".game-card").querySelector(".game-content").innerHTML;
  const previewWindow = window.open("", "_blank", "width=800,height=600");
  previewWindow.document.write(gameHTML);
  previewWindow.document.close();
}

// === Remove Game with Password ===
function removeGame(button) {
  const gameCard = button.closest(".game-card");
  const index = Array.from(document.querySelectorAll(".game-card")).indexOf(gameCard);

  const userInput = prompt("Enter admin password to remove this game:");
  if (userInput === password) {
    gameCard.remove();

    const games = JSON.parse(localStorage.getItem("skz_games")) || [];
    games.splice(index, 1);
    localStorage.setItem("skz_games", JSON.stringify(games));

    alert("✅ Game successfully deleted.");
  } else {
    alert("❌ Incorrect password. Game not removed.");
  }
}
