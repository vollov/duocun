import { CartActions } from './cart.actions';
import { ICart, ICartItem } from './cart.model';

export interface ICartAction {
  type: string;
  payload: ICart;
}


function updateCart(c: ICart, items: ICartItem[]) {
  const cart = Object.assign({}, c);
  cart.productTotal = 0;
  cart.quantity = 0;

  if (items && items.length > 0) {
    items.map(x => {
      cart.productTotal += x.price * x.quantity;
      cart.quantity += x.quantity;
    });
    const subtotal1 = cart.productTotal + cart.deliveryCost;
    cart.tax = Math.ceil(subtotal1 * 13) / 100;
    const subtotal2 = subtotal1 + cart.tax;
    cart.total = subtotal2 - cart.deliveryDiscount + cart.tips;
  } else {
    cart.productTotal = 0;
    cart.quantity = 0;
    cart.tax = 0;
    cart.total = 0;
  }
  return cart;
}

export const DEFAULT_CART = {
  quantity: 0,
  productTotal: 0,
  deliveryCost: 0,
  deliveryFee: 0,
  deliveryDiscount: 0,
  tax: 0,
  tips: 3,
  total: 0,
  items: []
};

export function cartReducer(state: ICart = DEFAULT_CART, action: ICartAction) {
  const items = [];
  let updated = null;
  let its = [];

  if (action.payload) {
    // const item = state.items.find(x => x.productId === payload.productId);

    switch (action.type) {
      case CartActions.UPDATE:
        return {
          ...state,
          ...action.payload.items
        };

      case CartActions.UPDATE_DELIVERY:
        return {
          ...state,
          merchantId: action.payload.merchantId,
          merchantName: action.payload.merchantName,
          deliveryCost: action.payload.deliveryCost,
          deliveryFee: action.payload.deliveryFee,
          deliveryDiscount: action.payload.deliveryDiscount
        };

      case CartActions.ADD_TO_CART:
        const itemsToAdd = action.payload.items;
        itemsToAdd.map(itemToAdd => {
          const x = state.items.find(item => item.productId === itemToAdd.productId);
          if (x) {
            items.push({ ...x, quantity: x.quantity + itemToAdd.quantity });
          } else {
            items.push({ ...itemToAdd });
          }
        });

        state.items.map(x => {
          const it = items.find(y => y.productId === x.productId);
          if (!it) {
            items.push(x);
          }
        });
        updated = updateCart(state, items);
        return {
          ...state,
          ...updated,
          items: items
        };
      case CartActions.REMOVE_FROM_CART:
        const itemsToRemove: ICartItem[] = action.payload.items;
        itemsToRemove.map((itemToRemove: ICartItem) => {
          const x = state.items.find(item => item.productId === itemToRemove.productId);
          if (x) {
            items.push({ ...x, quantity: x.quantity - itemToRemove.quantity });
          }
        });
        state.items.map(x => {
          const it = items.find(y => y.productId === x.productId);
          if (!it) {
            items.push(x);
          }
        });

        its = items.filter(x => x.quantity > 0);
        updated = updateCart(state, its);

        return {
          ...state,
          ...updated,
          items: its
        };

      case CartActions.UPDATE_FROM_CHANGE_ORDER:
        its = [...action.payload.items];
        updated = updateCart(state, its);

        return {
          ...state,
          ...updated,
          merchantId: action.payload.merchantId,
          merchantName: action.payload.merchantName,
          deliveryCost: action.payload.deliveryCost,
          deliveryFee: action.payload.deliveryFee,
          deliveryDiscount: action.payload.deliveryDiscount,
          items: its
        };

      case CartActions.CLEAR_CART:
        updated = updateCart(state, []);
        return {
          ...state,
          ...updated,
          items: []
        };
    }
  }

  return state;
}
