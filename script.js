const API_KEY = "4fa68b84ccb94999b2f91e2f7376b72e";

const searchBtn = document.getElementById("searchBtn");
const ingredientsInput = document.getElementById("ingredients");
const recipesEl = document.getElementById("recipes");


const modal = document.createElement("div");
modal.id = "recipeModal";
modal.className = "modal";
modal.innerHTML = `
  <div class="modal-content">
    <span class="close">&times;</span>
    <img class="modal-img" src="" alt="">
    <h2 class="modal-title"></h2>
    <p class="modal-used"></p>
    <p class="modal-missed"></p>
    <div class="modal-instructions"></div>
    <a class="modal-link" href="#" target="_blank">View Full Recipe</a>
  </div>
`;
document.body.appendChild(modal);

const modalImg = modal.querySelector(".modal-img");
const modalTitle = modal.querySelector(".modal-title");
const modalUsed = modal.querySelector(".modal-used");
const modalMissed = modal.querySelector(".modal-missed");
const modalInstructions = modal.querySelector(".modal-instructions");
const modalLink = modal.querySelector(".modal-link");
const modalClose = modal.querySelector(".close");

modalClose.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if(e.target === modal) modal.style.display = "none"; });

searchBtn.addEventListener("click", () => {
  const ingredients = ingredientsInput.value.trim();
  if(!ingredients) return alert("Please enter at least one ingredient.");
  fetchRecipes(ingredients);
});

async function fetchRecipes(ingredients){
  recipesEl.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Loading recipes...</p>';
  try{
    const res = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=12&apiKey=${API_KEY}`);
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    if(data.length === 0){
      recipesEl.innerHTML = '<p style="grid-column:1/-1;text-align:center;">No recipes found.</p>';
      return;
    }
    renderRecipes(data);
  }catch(err){
    console.error(err);
    recipesEl.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#ff8080;">Error fetching recipes. Check API key or network.</p>';
  }
}

function renderRecipes(items){
  recipesEl.innerHTML = "";
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img class="thumb" src="${item.image}" alt="${item.title}">
      <div class="meta">
        <h3>${item.title}</h3>
        <p class="used"><span class="icon">✅</span> Used: ${item.usedIngredientCount}</p>
        <p class="missed"><span class="icon">❌</span> Missing: ${item.missedIngredientCount}</p>
      </div>
    `;
    card.addEventListener("click", () => openModalWithInstructions(item.id));
    recipesEl.appendChild(card);
  });
}

async function openModalWithInstructions(id){
  try{
    const res = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`);
    if(!res.ok) throw new Error(await res.text());
    const recipe = await res.json();

    modalImg.src = recipe.image;
    modalTitle.textContent = recipe.title;
    modalUsed.innerHTML = `<span class="icon">✅</span> Used ingredients: ${recipe.usedIngredientCount || 'N/A'}`;
    modalMissed.innerHTML = `<span class="icon">❌</span> Missing ingredients: ${recipe.missedIngredientCount || 'N/A'}`;
    modalInstructions.innerHTML = recipe.instructions ? recipe.instructions : "No instructions available.";
    modalLink.href = recipe.sourceUrl || "#";

    modal.style.display = "flex";
  }catch(err){
    console.error(err);
    alert("Failed to load recipe instructions.");
  }
}
