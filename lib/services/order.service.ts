import { db } from "../db/db";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import {
  orders,
  orderItems,
  products,
  type SelectOrder,
  type SelectOrderItem,
  type SelectProduct,
} from "../db/schema";
import { UserRole } from "../enums";

type WhereCondition = SQL<unknown> | undefined;

// === Service Layer Types ===

export interface OrderFilters {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  page: number;
  pageSize: number;
}

export interface CompleteOrder {
  order: SelectOrder;
  orderItems: Array<{
    orderItem: SelectOrderItem;
    product: SelectProduct | null;
  }>;
}

// === Query Filter Builders ===

function createOrderFilters(filters: OrderFilters): WhereCondition[] {
  const conditions: WhereCondition[] = [];

  // Search filter - search by order number or customer name
  if (filters.search && filters.search.trim() !== "") {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      or(
        ilike(orders.orderNumber, searchTerm),
        ilike(orders.customerName, searchTerm)
      )
    );
  }

  // Order status filter
  if (filters.orderStatus && filters.orderStatus !== "all") {
    conditions.push(eq(orders.orderStatus, filters.orderStatus));
  }

  // Payment status filter
  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
  }

  return conditions;
}

// === Database Queries ===

async function fetchOrdersWithItems(
  conditions: WhereCondition[],
  limit: number,
  offset: number
) {
  const validConditions = conditions.filter(
    (c): c is SQL<unknown> => c !== undefined
  );

  const whereClause =
    validConditions.length > 0 ? and(...validConditions) : undefined;

  // Query orders with order items and products in a single query
  const results = await db
    .select({
      order: orders,
      orderItem: orderItems,
      product: products,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  return results;
}

async function fetchSingleOrderWithItems(orderId: string) {
  const results = await db
    .select({
      order: orders,
      orderItem: orderItems,
      product: products,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orders.id, orderId));

  return results;
}

// === Data Assembly ===

function groupOrdersByOrderId(
  queryResults: Array<{
    order: SelectOrder;
    orderItem: SelectOrderItem | null;
    product: SelectProduct | null;
  }>
): CompleteOrder[] {
  const ordersMap = new Map<string, CompleteOrder>();

  for (const row of queryResults) {
    const orderId = row.order.id;

    // Initialize order if not exists
    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        order: row.order,
        orderItems: [],
      });
    }

    // Add order item if exists
    if (row.orderItem) {
      const completeOrder = ordersMap.get(orderId)!;
      completeOrder.orderItems.push({
        orderItem: row.orderItem,
        product: row.product,
      });
    }
  }

  return Array.from(ordersMap.values());
}

// === Main Service ===

export const orderService = {
  /**
   * Get filtered list of orders with pagination
   */
  async getOrders(
    filters: OrderFilters,
    viewerRole: UserRole
  ): Promise<CompleteOrder[]> {
    // Build filter conditions
    const filterConditions = createOrderFilters(filters);

    // Calculate pagination
    const limit = filters.pageSize;
    const offset = (filters.page - 1) * filters.pageSize;

    // Fetch orders with items
    const queryResults = await fetchOrdersWithItems(
      filterConditions,
      limit,
      offset
    );

    // Group order items by order
    const completeOrders = groupOrdersByOrderId(queryResults);

    return completeOrders;
  },

  /**
   * Get single order by ID with all related data
   */
  async getOrderById(
    orderId: string,
    viewerRole: UserRole
  ): Promise<CompleteOrder | null> {
    // Fetch order with items
    const queryResults = await fetchSingleOrderWithItems(orderId);

    if (queryResults.length === 0) {
      return null;
    }

    // Group order items by order
    const completeOrders = groupOrdersByOrderId(queryResults);

    return completeOrders[0] || null;
  },
};
