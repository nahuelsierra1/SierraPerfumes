import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Search, ShoppingBag, Plus, Minus, X, Trash2, Instagram, MessageCircle, Sparkles, ChevronRight } from "lucide-react";
import { STORE, CATEGORIES } from "./config";
import { products } from "./products";
import "./styles.css";

const money = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

function App() {
  const [category, setCategory] = useState("todos");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({});
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const cartItems = useMemo(
    () => Object.entries(cart)
      .map(([id, qty]) => ({ product: products.find(p => p.id === id), qty }))
      .filter(x => x.product),
    [cart]
  );

  const totalUnits = cartItems.reduce((s, x) => s + x.qty, 0);
  const total = cartItems.reduce((s, x) => s + x.product.price * x.qty, 0);

  const add = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const remove = (id) => setCart(c => {
    const next = { ...c };
    if (!next[id]) return next;
    next[id]--;
    if (next[id] <= 0) delete next[id];
    return next;
  });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(p => {
      const categoryMatch =
        category === "todos" ? p.stock :
        category === "sin-stock" ? !p.stock :
        p.category === category && p.stock;

      const searchMatch = !q || [p.name, p.brand, ...p.notes].join(" ").toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  }, [category, query]);

  const featured = products.filter(p => p.featured && p.stock);

  const sendWhatsApp = () => {
    if (!cartItems.length) return;
    const lines = cartItems.map(({ product, qty }) =>
      `• ${qty}x ${product.name} — ${money(product.price)} c/u`
    );
    const message = [
      `Hola! Quiero hacer el siguiente pedido:`,
      ``,
      ...lines,
      ``,
      `Total: ${money(total)}`,
      ``,
      `Quedo atento/a. ¡Gracias!`
    ].join("\n");

    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">{STORE.name}</div>
          <div className="mini">CATÁLOGO OFICIAL</div>
        </div>
        <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Abrir carrito">
          <ShoppingBag size={21} />
          {totalUnits > 0 && <span className="badge">{totalUnits}</span>}
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-text">
            <div className="eyebrow"><Sparkles size={14}/> FRAGANCIAS SELECCIONADAS</div>
            <h1>{STORE.slogan}</h1>
            <p>{STORE.description}</p>
            <div className="hero-pills">
              <span>60 ml · Extracto</span>
              <span>Alta fijación</span>
              <span>Envíos a todo el país</span>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?fit=crop&w=900&h=1300&fm=png&q=85"
              alt="Perfume destacado"
            />
          </div>
        </section>

        <section className="featured">
          <div className="section-head">
            <div>
              <span className="kicker">LOS MÁS ELEGIDOS</span>
              <h2>Favoritos</h2>
            </div>
            <ChevronRight size={18}/>
          </div>
          <div className="featured-row">
            {featured.map(p => (
              <button className="featured-card" key={p.id} onClick={() => setSelected(p)}>
                <img src={p.image} alt={p.name}/>
                <div>
                  <small>{p.brand}</small>
                  <strong>{p.name}</strong>
                  <span>{money(p.price)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="catalog">
          <div className="catalog-head">
            <div>
              <span className="kicker">CATÁLOGO</span>
              <h2>Encontrá tu fragancia</h2>
            </div>
          </div>

          <div className="search">
            <Search size={19}/>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar perfume, marca o aroma..." />
            {query && <button onClick={() => setQuery("")}><X size={17}/></button>}
          </div>

          <div className="categories">
            {CATEGORIES.map(c => (
              <button key={c.id} className={category === c.id ? "active" : ""} onClick={() => setCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid">
            {visible.map(p => (
              <article className={`product ${!p.stock ? "out" : ""}`} key={p.id}>
                <button className="product-main" onClick={() => setSelected(p)}>
                  <div className="photo-wrap">
                    <img src={p.image} alt={p.name}/>
                    {p.featured && <span className="featured-tag">DESTACADO</span>}
                    {!p.stock && <span className="out-tag">SIN STOCK</span>}
                  </div>
                  <div className="product-info">
                    <span className="brand-name">{p.brand}</span>
                    <h3>{p.name}</h3>
                    <span className="meta">{p.size} · {p.type}</span>
                    <div className="notes">{p.notes.map(n => <span key={n}>{n}</span>)}</div>
                    <strong className="price">{money(p.price)}</strong>
                  </div>
                </button>
                {p.stock ? (
                  <button className="add" onClick={() => add(p.id)} aria-label={`Agregar ${p.name}`}>
                    <Plus size={22}/>
                  </button>
                ) : (
                  <div className="disabled">Agotado</div>
                )}
              </article>
            ))}
          </div>

          {!visible.length && (
            <div className="empty">No encontramos perfumes con esa búsqueda.</div>
          )}
        </section>
      </main>

      <footer>
        <div className="footer-brand">{STORE.name}</div>
        <p>{STORE.slogan}</p>
        <div className="footer-links">
          <a href={STORE.instagram} target="_blank" rel="noreferrer"><Instagram size={16}/> Instagram</a>
          <span><MessageCircle size={16}/> WhatsApp</span>
        </div>
        <small>{STORE.location} · {STORE.shipping}</small>
      </footer>

      {totalUnits > 0 && (
        <button className="cart-bar" onClick={() => setCartOpen(true)}>
          <span><ShoppingBag size={19}/> Ver pedido</span>
          <b>{totalUnits} {totalUnits === 1 ? "unidad" : "unidades"} · {money(total)}</b>
        </button>
      )}

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal product-modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}><X/></button>
            <img src={selected.image} alt={selected.name}/>
            <span className="brand-name">{selected.brand}</span>
            <h2>{selected.name}</h2>
            <span className="meta">{selected.size} · {selected.type}</span>
            <div className="notes large">{selected.notes.map(n => <span key={n}>{n}</span>)}</div>
            <p>{selected.description}</p>
            <div className="modal-bottom">
              <strong>{money(selected.price)}</strong>
              {selected.stock ? (
                <button className="primary" onClick={() => { add(selected.id); setSelected(null); }}>Agregar <Plus size={18}/></button>
              ) : <span className="sold">Sin stock</span>}
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)}>
          <aside className="cart" onClick={e => e.stopPropagation()}>
            <div className="cart-head">
              <div><span className="kicker">TU SELECCIÓN</span><h2>Mi pedido</h2></div>
              <button className="close small" onClick={() => setCartOpen(false)}><X/></button>
            </div>

            <div className="cart-list">
              {!cartItems.length && <div className="empty">Todavía no agregaste perfumes.</div>}
              {cartItems.map(({ product, qty }) => (
                <div className="cart-item" key={product.id}>
                  <img src={product.image} alt={product.name}/>
                  <div className="cart-item-info">
                    <small>{product.brand}</small>
                    <strong>{product.name}</strong>
                    <span>{money(product.price)}</span>
                    <div className="qty">
                      <button onClick={() => remove(product.id)}><Minus size={15}/></button>
                      <b>{qty}</b>
                      <button onClick={() => add(product.id)}><Plus size={15}/></button>
                    </div>
                  </div>
                  <button className="trash" onClick={() => setCart(c => { const n={...c}; delete n[product.id]; return n; })}><Trash2 size={17}/></button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="total"><span>Total</span><strong>{money(total)}</strong></div>
              <button className="whatsapp" disabled={!cartItems.length} onClick={sendWhatsApp}>
                <MessageCircle size={20}/> Pedir por WhatsApp
              </button>
              {cartItems.length > 0 && <button className="clear" onClick={() => setCart({})}>Vaciar pedido</button>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);