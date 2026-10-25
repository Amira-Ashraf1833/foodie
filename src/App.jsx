import { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Clock,
  Star,
  MessageCircle,
  Utensils,
} from "lucide-react";
import { getMeals, getCategories } from "./services/foodApi";
import "./App.css";
import { sendChatMessage } from "./services/chatApi";

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const removeFromCart = (indexToRemove) => {
    setCart((currentCart) =>
      currentCart.filter((item, index) => index !== indexToRemove),
    );
  };

  const increaseQuantity = (indexToUpdate) => {
    setCart((currentCart) =>
      currentCart.map((item, index) =>
        index === indexToUpdate
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = (indexToUpdate) => {
    setCart((currentCart) =>
      currentCart.map((item, index) =>
        index === indexToUpdate
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) }
          : item,
      ),
    );
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Hi! 👋 I'm Foodie AI. What would you like to eat today?",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesEndRef = useRef(null);
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatMessages, chatLoading]);

  async function handleChatSubmit(event) {
    event.preventDefault();

    const message = chatInput.trim();
    if (!message || chatLoading) return;

    setChatMessages((previous) => [
      ...previous,
      { role: "user", text: message },
    ]);
    setChatInput("");
    setChatLoading(true);

    try {
      const reply = await sendChatMessage(message, foods);

      setChatMessages((previous) => [
        ...previous,
        { role: "assistant", text: reply },
      ]);
    } catch (error) {
      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "Sorry, I couldn't connect right now. Please try again.",
        },
      ]);
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    async function loadFoods() {
      try {
        setLoading(true);
        setError("");

        const meals = await getMeals();
        setFoods(meals);
        const categoryData = await getCategories();
        setCategories(categoryData);
      } catch (err) {
        setError("Couldn't load meals. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadFoods();
  }, []);

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPrice = cart.reduce(
    (total, item) => total + (Number(item.price) || 0) * (item.quantity || 1),
    0,
  );

  return (
    <div className="app">
      <nav className="navbar">
        <a className="logo" href="#">
          <Utensils size={27} />
          Foodie<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#menu">Our Menu</a>
          <a href="#about">About</a>
        </div>
        <button className="cart-button" onClick={() => setCartOpen(!cartOpen)}>
          <ShoppingCart size={20} />
          Cart ({cart.length})
        </button>

        {cartOpen && (
          <div className="cart-dropdown">
            <h3>Your Cart 🛒</h3>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cart.map((item, index) => (
                <div className="cart-item" key={item.id ?? index}>
                  <div className="cart-item-info">
                    <span>{item.name}</span>
                    <span>
                      {item.price != null
                        ? `${item.price} EGP`
                        : "Price unavailable"}
                    </span>
                  </div>

                  <div className="quantity-controls">
                    <button onClick={() => decreaseQuantity(index)}>−</button>

                    <span>{item.quantity || 1}</span>

                    <button onClick={() => increaseQuantity(index)}>+</button>
                  </div>

                  <strong>
                    {item.price != null
                      ? `${Number(item.price) * (item.quantity || 1)} EGP`
                      : ""}
                  </strong>

                  <button onClick={() => removeFromCart(index)}>Remove</button>
                </div>
              ))
            )}

            <h4>Total: {totalPrice.toFixed(2)} EGP</h4>

            {cart.length > 0 && (
              <button
                className="checkout-button"
                onClick={() => setCheckoutOpen(true)}
              >
                Proceed to Checkout
              </button>
            )}

            {checkoutOpen && (
              <form
                className="checkout-form"
                onSubmit={(event) => {
                  event.preventDefault();

                  if (cart.length === 0) return;

                  alert(
                    "Your order has been placed successfully! Payment: Cash on Delivery.",
                  );
                  setCart([]);
                  setCheckoutOpen(false);
                  setCartOpen(false);
                }}
              >
                <h3>Complete Your Order</h3>

                <label>
                  Full Name
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    required
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    pattern="[0-9+\-\s]{8,15}"
                    required
                  />
                </label>

                <label>
                  Delivery Address
                  <textarea
                    name="address"
                    placeholder="Enter your full address"
                    required
                  />
                </label>

                <p>
                  <strong>Payment Method:</strong> Cash on Delivery
                </p>
                <p>
                  <strong>Total:</strong> {totalPrice.toFixed(2)} EGP
                </p>

                <button type="submit">Confirm Order</button>

                <button type="button" onClick={() => setCheckoutOpen(false)}>
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}
      </nav>

      <main>
        <section className="hero" id="about">
          <div className="hero-content">
            <span className="eyebrow">DELICIOUS FOOD, DELIVERED</span>

            <h1>
              Enjoy Your
              <br />
              Favorite <span>Food.</span>
            </h1>

            <p>
              Discover delicious meals made with love and explore recipes from
              around the world.
            </p>

            <a className="primary-button" href="#menu">
              Explore Menu →
            </a>

            <div className="hero-features">
              <span>
                <Clock size={17} /> Discover Recipes
              </span>
              <span>
                <Star size={17} /> Tasty Meals
              </span>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"
              alt="Delicious burger"
            />
            <div className="floating-card">
              <span>🍔</span>
              <div>
                <strong>Fresh & Tasty</strong>
                <small>Find your next favorite meal</small>
              </div>
            </div>
          </div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <span className="eyebrow">OUR MENU</span>
              <h2>Popular Dishes</h2>
            </div>

            <label className="search-box">
              <Search size={19} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for food..."
              />
            </label>
          </div>

          <div className="category-list">
            <button
              className={
                selectedCategory === "All"
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() => setSelectedCategory("All")}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.idCategory}
                className={
                  selectedCategory === category.strCategory
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => setSelectedCategory(category.strCategory)}
              >
                {category.strCategory}
              </button>
            ))}
          </div>

          {loading && (
            <p className="empty-message">Loading delicious meals...</p>
          )}

          {error && (
            <div className="empty-message">
              <p>{error}</p>
              <button
                className="add-button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="food-grid">
              {filteredFoods.map((food) => (
                <article className="food-card" key={food.id}>
                  <img src={food.image} alt={food.name} />

                  <div className="food-info">
                    <div className="food-title">
                      <h3>{food.name}</h3>
                      <span>
                        <Star size={15} /> 4.8
                      </span>
                    </div>

                    <p>{food.category}</p>

                    <div className="food-bottom">
                      <strong>{food.price ?? 150} EGP</strong>

                      <button
                        className="add-button"
                        onClick={() =>
                          setCart((previous) => {
                            const existingFood = previous.find(
                              (item) => item.id === food.id,
                            );

                            if (existingFood) {
                              return previous.map((item) =>
                                item.id === food.id
                                  ? {
                                      ...item,
                                      quantity: (item.quantity || 1) + 1,
                                    }
                                  : item,
                              );
                            }

                            return [...previous, { ...food, quantity: 1 }];
                          })
                        }
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {filteredFoods.length === 0 && (
                <p className="empty-message">
                  No dishes found. Try another search.
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      <button
        className="chat-button"
        onClick={() => {
          setChatOpen(true);
          console.log("Chat opened:", true);
        }}
        aria-label="Open chat assistant"
      >
        <MessageCircle size={25} />
      </button>

      {chatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Foodie AI Assistant 🍔</h3>
            <button onClick={() => setChatOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {chatMessages.map((message, index) => (
              <p
                key={index}
                className={
                  message.role === "user" ? "user-message" : "assistant-message"
                }
              >
                {message.text}
              </p>
            ))}
            {chatLoading && (
              <p className="assistant-message typing-indicator">
                Foodie AI is typing...
              </p>
            )}
            <div ref={chatMessagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleChatSubmit}>
            <input
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask me about food..."
              disabled={chatLoading}
            />

            <button type="submit" disabled={chatLoading || !chatInput.trim()}>
              {chatLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}

      <footer>© 2026 Foodie. Made with ❤️ for food lovers.</footer>
    </div>
  );
}
