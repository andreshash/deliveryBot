//import Parse from 'parse'
import ConsumerAddress from './models/ConsumerAddress'

Parse.Object.registerSubclass('ConsumerAddress', ConsumerAddress);

const User = Parse.Object.extend('User');
const FacebookUser = Parse.Object.extend('FacebookUser');
const Category = Parse.Object.extend('Category');
const Customer = Parse.Object.extend('Customer');
const Cart = Parse.Object.extend('Cart');
const Consumer = Parse.Object.extend('Consumer');
const CustomerPointSale = Parse.Object.extend('CustomerPointSale');
const Modifier = Parse.Object.extend('Modifier');
const ModifierGroup = Parse.Object.extend('ModifierGroup');
const ModifierItem = Parse.Object.extend('ModifierItem');
const Order = Parse.Object.extend('Order');
const OrderItem = Parse.Object.extend('OrderItem');
const OrderItemModifier = Parse.Object.extend('OrderItemModifier');
const OrderItemModifierGroup = Parse.Object.extend('OrderItemModifierGroup');
const Product = Parse.Object.extend('Product');
const PaymentMethod = Parse.Object.extend('PaymentMethod');

module.exports = {
    User,
    FacebookUser,
    Cart,
    Category,
    Consumer,
    ConsumerAddress,
    Customer,
    CustomerPointSale,
    Modifier,
    ModifierGroup,
    ModifierItem,
    Order,
    OrderItem,
    OrderItemModifier,
    OrderItemModifierGroup,
    PaymentMethod,
    Product
}