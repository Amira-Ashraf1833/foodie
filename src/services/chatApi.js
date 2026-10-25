export async function sendChatMessage(message, meals = []) {
  const response = await fetch("http://localhost:3001/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,

      meals: meals.map((meal) => ({
        name: meal.name,
        category: meal.category,
        price: meal.price ?? null,
      })),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send message");
  }

  return data.reply;
}
