const API_URL = "https://www.themealdb.com/api/json/v1/1";

export async function getMeals() {
  const response = await fetch(`${API_URL}/search.php?s=`);

  if (!response.ok) {
    throw new Error("Failed to fetch meals");
  }

  const data = await response.json();

  return (data.meals || []).map((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory || "Meal",
    image: meal.strMealThumb,
    instructions: meal.strInstructions,
    price: 100,
  }));
}

export async function searchMeals(query) {
  const response = await fetch(
    `${API_URL}/search.php?s=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to search meals");
  }

  const data = await response.json();

  return (data.meals || []).map((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory || "Meal",
    image: meal.strMealThumb,
    instructions: meal.strInstructions,
    price: 100,
  }));
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories.php`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await response.json();
  return data.categories || [];
}
