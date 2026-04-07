import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from LocalStorage on startup
    useEffect(() => {
        const savedCart = localStorage.getItem('trueEatsCart');
        if (savedCart) setCartItems(JSON.parse(savedCart));
    }, []);

    // Save cart to LocalStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('trueEatsCart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        const exist = cartItems.find((x) => x._id === product._id);
        if (exist) {
            setCartItems(cartItems.map((x) => x._id === product._id ? { ...exist, qty: exist.qty + 1 } : x));
        } else {
            setCartItems([...cartItems, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (product) => {
        const exist = cartItems.find((x) => x._id === product._id);
        if (exist.qty === 1) {
            setCartItems(cartItems.filter((x) => x._id !== product._id));
        } else {
            setCartItems(cartItems.map((x) => x._id === product._id ? { ...exist, qty: exist.qty - 1 } : x));
        }
    };

    const clearCart = () => setCartItems([]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};