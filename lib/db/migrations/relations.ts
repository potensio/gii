import { relations } from "drizzle-orm/relations";
import { products, productVariantCombinations, productVariants, productGroups, users, verifyCodes, addresses, carts, cartItems, orders, orderItems } from "./schema";

export const productVariantCombinationsRelations = relations(productVariantCombinations, ({one}) => ({
	product: one(products, {
		fields: [productVariantCombinations.productId],
		references: [products.id]
	}),
	productVariant: one(productVariants, {
		fields: [productVariantCombinations.variantId],
		references: [productVariants.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productVariantCombinations: many(productVariantCombinations),
	productGroup: one(productGroups, {
		fields: [products.productGroupId],
		references: [productGroups.id]
	}),
	cartItems: many(cartItems),
	orderItems: many(orderItems),
}));

export const productVariantsRelations = relations(productVariants, ({one, many}) => ({
	productVariantCombinations: many(productVariantCombinations),
	productGroup: one(productGroups, {
		fields: [productVariants.productGroupId],
		references: [productGroups.id]
	}),
}));

export const productGroupsRelations = relations(productGroups, ({many}) => ({
	productVariants: many(productVariants),
	products: many(products),
}));

export const verifyCodesRelations = relations(verifyCodes, ({one}) => ({
	user: one(users, {
		fields: [verifyCodes.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	verifyCodes: many(verifyCodes),
	addresses: many(addresses),
	carts: many(carts),
	orders: many(orders),
}));

export const addressesRelations = relations(addresses, ({one}) => ({
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id]
	}),
}));

export const cartsRelations = relations(carts, ({one, many}) => ({
	user: one(users, {
		fields: [carts.userId],
		references: [users.id]
	}),
	cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id]
	}),
	product: one(products, {
		fields: [cartItems.productId],
		references: [products.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));