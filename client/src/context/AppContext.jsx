import { createContext, useContext, useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContaxt = createContext();

export const AppContaxtProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [products, setproducts] = useState([])

    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState({})

    //Fetch seller Status
    const fetchSeller = async () => {
        try {
            const { data } = await axios.get('/api/seller/is-auth');
            if (data.success) {
                setIsSeller(true)
            } else {
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }

    // Fetch User Auth Status , User Data and Cart items
    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user/is-auth');
            console.log("[FetchUser] response:", data);
            if (data.success) {
                setUser(data.user);
                setCartItems(data.user.cartItems || []);
            }
        } catch (error) {
            console.log('Auth error:', error.message);
            setUser(null);
        }
    };

    //Fatch all product
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/product/list')
            if (data.success) {
                setproducts(data.products)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(data.message)
        }
    }

    //Add product to cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId] += 1;

        } else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Addad to cart")
    }

    //update Cart Item Quantaty
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData)
        toast.success("Cart Updated")
    }

    //Remove from cart
    const removeFromCart = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] -= 1;
            if (cartData[itemId] === 0) {
                delete cartData[itemId];
            }
        }
        toast.success("Removed From Cart")
        setCartItems(cartData)
    }

    //get cart item count
    const getCartCount = () => {
        let totalCount = 0;
        for (const item in cartItems) {
            totalCount += cartItems[item]
        }
        return totalCount
    }

    //get cart total amount
    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items]
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        console.log("[FetchUser] fetching user…");
        fetchUser();
        fetchSeller()
        fetchProducts()
    }, [])

    // Update Database Cart Item 
    // AppContext.jsx or jahan bhi useEffect likha hai

    useEffect(() => {
        console.log("[CartEffect] running...");
        console.log("[CartEffect] user:", user);
        console.log("[CartEffect] cartItems:", cartItems);

        if (!user || !user._id) {
            console.log("[CartEffect] user not ready, skipping update");
            return;
        }

        if (!cartItems || typeof cartItems !== "object") {
            console.log("[CartEffect] invalid cartItems");
            return;
        }


        const updateCart = async () => {
            try {
                const { data } = await axios.post("/api/cart/update", {
                    cartItems, // userId backend se hi mil raha via JWT
                });

                console.log("[CartEffect] updateCart response:", data);
                if (!data.success) {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error("Cart Update Error");
                console.log(error);
            }
        };

        updateCart();
    }, [cartItems, user]);

    const value = {
        navigate, user, setUser, isSeller, setIsSeller, showUserLogin, setShowUserLogin,
        products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery,
        getCartAmount, getCartCount, axios, fetchProducts, setCartItems
    }


    return <AppContaxt.Provider value={value}>
        {children}
    </AppContaxt.Provider>
}

export const useAppContext = () => {
    return useContext(AppContaxt)
}