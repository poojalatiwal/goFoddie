import React, { useReducer, useContext, createContext } from "react";

const CartStateContext = createContext();
const CartDispatchContext = createContext();
const getUser = () => localStorage.getItem("cartUser");


const getInitialCart = () => {
  const user = getUser();
  if (!user) return [];

  const stored = localStorage.getItem(`cart_${user}`);
  try {
    return stored ? JSON.parse(stored).filter(i => i && i.id) : [];
  } catch {
    return [];
  }
};

const reducer = (state, action) => {
  let updatedCart = [...state];

  switch (action.type) {
    case "ADD":
  if (!action.item || !action.item.id || !action.item.price) return state;

  updatedCart.push({
    ...action.item,
    qty: action.item.qty || 1,
    singlePrice: action.item.singlePrice || action.item.price, 
    price: (action.item.qty || 1) * (action.item.singlePrice || action.item.price),
  });
  break;

    case "REMOVE":
      updatedCart = updatedCart.filter((_, i) => i !== action.index);
      break;

    case "DROP":
      updatedCart = [];
      break;

    case "UPDATE":
      updatedCart = updatedCart.map((food) =>
        food.id === action.id
          ? {
              ...food,
              qty: food.qty + parseInt(action.qty),
              price: (food.qty + parseInt(action.qty)) * food.singlePrice,
            }
          : food
      );
      break;

    case "INCREMENT_QTY":
      updatedCart[action.index].qty += 1;
      updatedCart[action.index].price =
        updatedCart[action.index].qty * updatedCart[action.index].singlePrice;
      break;

    case "DECREMENT_QTY":
      if (updatedCart[action.index].qty > 1) {
        updatedCart[action.index].qty -= 1;
        updatedCart[action.index].price =
          updatedCart[action.index].qty *
          updatedCart[action.index].singlePrice;
      }
      break;

    default:
      return state;
  }


  const user = getUser();
  if (user) {
    localStorage.setItem(`cart_${user}`, JSON.stringify(updatedCart));
  }

  return updatedCart;
};


export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, [], getInitialCart);

  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
};

export const useCart = () => useContext(CartStateContext);
export const useDispatchCart = () => useContext(CartDispatchContext);
