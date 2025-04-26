'use client'

import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = (props) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY;
    const router = useRouter();

    const { user } = useUser();
    const { getToken } = useAuth();

    const [products, setProducts] = useState([]);
    const [userData, setUserData] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [cartItems, setCartItems] = useState({});

    const fetchProductData = async () => {
        try {
            const {data } = await axios.get('/api/product/list')
         
            if(data.success){
                
                setProducts(data.products);
            }
            else{
                toast.error(data.message)
            }
          
        } catch (error) {
            toast.error(error.message)
            
        }
    };

    const fetchUserData = async () => {
        try {
            if (user?.publicMetadata?.role === 'seller') {
                setIsSeller(true);
            }

            const token = await getToken();

            const { data } = await axios.get('/api/user/data', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                setUserData(data.user);
                setCartItems(data.user.cartItems);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const addToCart = async (itemId) => {
        const cartData = structuredClone(cartItems);
        cartData[itemId] = (cartData[itemId] || 0) + 1;
        setCartItems(cartData);
       

        if(user){
            try {
                const token = await getToken()

                await axios.post('/api/cart/update',{cartData},{headers:{Authorization:`Bearer ${token}`}})
                toast.success("Item added to cart")
                
            } catch (error) {
                toast.error(error.message)
                
            }
        }
    };

    const updateCartQuantity = async (itemId, quantity) => {
        const cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
        if(user){
            try {
                const token = await getToken()

                await axios.post('/api/cart/update',{cartData},{headers:{Authorization:`Bearer ${token}`}})
                toast.success("Cart Updated ")
                
            } catch (error) {
                toast.error(error.message)
                
            }
        }
    };

    const getCartCount = () => {
        return Object.values(cartItems).reduce((total, count) => total + count, 0);
    };

    const getCartAmount = () => {
        return Math.floor(
            Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
                const item = products.find(p => p._id === itemId);
                return item ? total + item.offerPrice * quantity : total;
            }, 0) * 100
        ) / 100;
    };

    useEffect(() => {
        if (user) {
            fetchProductData();
            fetchUserData();
        }
    }, [user]);

    const value = {
        currency,
        router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        user, getToken
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
