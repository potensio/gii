# Product API Refactor - Manual Testing Guide

This guide provides step-by-step instructions for manually testing the refactored product API implementation.

## Prerequisites

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Ensure you have admin credentials to test authorization

3. Use a tool like Postman, Insomnia, or curl for API testing

## Test Cases

### Test 1: Create Product Without Variants

**Endpoint:** `POST /api/admin/products`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "name": "Simple Test Product",
  "category": "smartphones",
  "brand": "apple",
  "description": "A simple product without variants",
  "weight": 200,
  "isActive": true,
  "additionalDescriptions": [
    { "title": "Feature 1", "body": "Description 1" },
    { "title": "", "body": "" },
    { "title": "Feature 2", "body": "Description 2" }
  ],
  "hasVariants": false,
  "variantTypes": [],
  "combinations": [
    {
      "variants": {},
      "sku": "MANUAL-TEST-001",
      "name": "Simple Test Product",
      "price": 1000000,
      "stock": 10,
      "active": true
    }
  ]
}
```

**Expected Result:**

- Status: 201 Created
- Response contains `productGroup` and `products` array
- Only 2 additional descriptions (empty one filtered out)
- 1 product created with SKU "MANUAL-TEST-001"

**Verification:**

```sql
-- Check product group
SELECT * FROM product_groups WHERE name = 'Simple Test Product';

-- Check products
SELECT * FROM products WHERE sku = 'MANUAL-TEST-001';

-- Check variants (should be empty)
SELECT * FROM product_variants WHERE product_group_id = '<product_group_id>';
```

---

### Test 2: Create Product With Variants

**Endpoint:** `POST /api/admin/products`

**Request Body:**

```json
{
  "name": "Variant Test Product",
  "category": "smartphones",
  "brand": "samsung",
  "description": "A product with color and storage variants",
  "weight": 250,
  "isActive": true,
  "additionalDescriptions": [
    { "title": "Specification", "body": "High quality product" }
  ],
  "hasVariants": true,
  "variantTypes": ["color", "storage"],
  "combinations": [
    {
      "variants": { "color": "Black", "storage": "128GB" },
      "sku": "MANUAL-TEST-BLACK-128",
      "name": "Variant Test Product Black 128GB",
      "price": 1500000,
      "stock": 5,
      "active": true
    },
    {
      "variants": { "color": "White", "storage": "256GB" },
      "sku": "MANUAL-TEST-WHITE-256",
      "name": "Variant Test Product White 256GB",
      "price": 1800000,
      "stock": 3,
      "active": true
    }
  ]
}
```

**Expected Result:**

- Status: 201 Created
- 2 products created
- 4 variants created (2 colors + 2 storage options)
- Each product has 2 variant combinations

**Verification:**

```sql
-- Check variants
SELECT * FROM product_variants WHERE product_group_id = '<product_group_id>';
-- Should return 4 rows

-- Check products
SELECT * FROM products WHERE product_group_id = '<product_group_id>';
-- Should return 2 rows

-- Check variant combinations
SELECT pvc.*, pv.variant, pv.value
FROM product_variant_combinations pvc
JOIN product_variants pv ON pvc.variant_id = pv.id
WHERE pvc.product_id IN (SELECT id FROM products WHERE product_group_id = '<product_group_id>');
-- Should return 4 rows (2 combinations per product)
```

---

### Test 3: Update Product Without Variants

**Endpoint:** `PATCH /api/admin/products/<product_group_id>`

Use the product group ID from Test 1.

**Request Body:**

```json
{
  "name": "Updated Simple Test Product",
  "category": "smartphones",
  "brand": "apple",
  "description": "Updated description",
  "weight": 220,
  "isActive": true,
  "additionalDescriptions": [
    { "title": "New Feature", "body": "New Description" }
  ],
  "hasVariants": false,
  "variantTypes": [],
  "combinations": [
    {
      "variants": {},
      "sku": "MANUAL-TEST-001-UPDATED",
      "name": "Updated Simple Test Product",
      "price": 1200000,
      "stock": 15,
      "active": true
    }
  ]
}
```

**Expected Result:**

- Status: 200 OK
- Product group name updated
- Old product deleted, new product created with updated SKU
- Additional descriptions updated

**Verification:**

```sql
-- Check product group
SELECT * FROM product_groups WHERE id = '<product_group_id>';
-- Name should be "Updated Simple Test Product"

-- Check products
SELECT * FROM products WHERE product_group_id = '<product_group_id>';
-- Should have new SKU "MANUAL-TEST-001-UPDATED"
```

---

### Test 4: Update Product With Variants

**Endpoint:** `PATCH /api/admin/products/<product_group_id>`

Use the product group ID from Test 2.

**Request Body:**

```json
{
  "name": "Updated Variant Test Product",
  "category": "smartphones",
  "brand": "samsung",
  "description": "Updated with new variants",
  "weight": 260,
  "isActive": true,
  "additionalDescriptions": [],
  "hasVariants": true,
  "variantTypes": ["color", "storage"],
  "combinations": [
    {
      "variants": { "color": "Blue", "storage": "512GB" },
      "sku": "MANUAL-TEST-BLUE-512",
      "name": "Updated Variant Test Product Blue 512GB",
      "price": 2000000,
      "stock": 8,
      "active": true
    }
  ]
}
```

**Expected Result:**

- Status: 200 OK
- Old products and variants deleted
- New product and variants created
- Only 1 product with new variant combination

**Verification:**

```sql
-- Check variants (should be new ones)
SELECT * FROM product_variants WHERE product_group_id = '<product_group_id>';
-- Should return 2 rows (Blue, 512GB)

-- Check products (should be only 1)
SELECT * FROM products WHERE product_group_id = '<product_group_id>';
-- Should return 1 row with SKU "MANUAL-TEST-BLUE-512"
```

---

### Test 5: Transaction Rollback on Duplicate SKU

**Endpoint:** `POST /api/admin/products`

First, create a product with a specific SKU, then try to create another with the same SKU.

**First Request:**

```json
{
  "name": "First Product",
  "category": "smartphones",
  "brand": "xiaomi",
  "isActive": true,
  "hasVariants": false,
  "variantTypes": [],
  "combinations": [
    {
      "variants": {},
      "sku": "DUPLICATE-SKU-TEST",
      "price": 1000000,
      "stock": 10,
      "active": true
    }
  ]
}
```

**Second Request (should fail):**

```json
{
  "name": "Second Product",
  "category": "smartphones",
  "brand": "xiaomi",
  "isActive": true,
  "hasVariants": false,
  "variantTypes": [],
  "combinations": [
    {
      "variants": {},
      "sku": "DUPLICATE-SKU-TEST",
      "price": 1500000,
      "stock": 5,
      "active": true
    }
  ]
}
```

**Expected Result:**

- First request: 201 Created
- Second request: 500 or 400 error
- No partial data created (transaction rolled back)

**Verification:**

```sql
-- Check product groups
SELECT * FROM product_groups WHERE name = 'Second Product';
-- Should return 0 rows (transaction rolled back)

-- Check products
SELECT * FROM products WHERE sku = 'DUPLICATE-SKU-TEST';
-- Should return only 1 row (from first request)
```

---

### Test 6: Authorization Check

**Endpoint:** `POST /api/admin/products`

**Test 6a: Without Authorization Header**

**Headers:**

```
Content-Type: application/json
```

**Expected Result:**

- Status: 401 Unauthorized
- Error message about missing authorization

**Test 6b: With Non-Admin User**

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <user_token>
```

**Expected Result:**

- Status: 401 or 403 Unauthorized
- Error message about insufficient permissions

**Test 6c: With Admin User**

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <admin_token>
```

**Expected Result:**

- Status: 201 Created
- Product created successfully

---

### Test 7: Validation Errors

**Test 7a: Missing Required Fields**

**Request Body:**

```json
{
  "name": "",
  "category": "smartphones",
  "brand": "apple",
  "isActive": true,
  "hasVariants": false,
  "variantTypes": [],
  "combinations": []
}
```

**Expected Result:**

- Status: 400 Bad Request
- Validation error for empty name
- Validation error for empty combinations

**Test 7b: Incomplete Variant Configuration**

**Request Body:**

```json
{
  "name": "Incomplete Variant Product",
  "category": "smartphones",
  "brand": "samsung",
  "isActive": true,
  "hasVariants": true,
  "variantTypes": ["color", "storage"],
  "combinations": [
    {
      "variants": { "color": "Black" },
      "sku": "INCOMPLETE-001",
      "price": 1000000,
      "stock": 10,
      "active": true
    }
  ]
}
```

**Expected Result:**

- Status: 400 Bad Request
- Validation error about missing storage variant

**Test 7c: Variants When hasVariants is False**

**Request Body:**

```json
{
  "name": "Invalid Variant Product",
  "category": "smartphones",
  "brand": "xiaomi",
  "isActive": true,
  "hasVariants": false,
  "variantTypes": [],
  "combinations": [
    {
      "variants": { "color": "Black" },
      "sku": "INVALID-001",
      "price": 1000000,
      "stock": 10,
      "active": true
    }
  ]
}
```

**Expected Result:**

- Status: 400 Bad Request
- Validation error about variants when hasVariants is false

---

## Verification Checklist

After running all tests, verify:

- [ ] Products without variants can be created
- [ ] Products with variants can be created
- [ ] Products without variants can be updated
- [ ] Products with variants can be updated
- [ ] Empty additional descriptions are filtered out
- [ ] Duplicate SKU errors are caught and transaction rolls back
- [ ] Authorization checks work for all endpoints
- [ ] Validation errors are properly formatted and returned
- [ ] All database operations are atomic (no partial data on errors)
- [ ] Error responses follow consistent format

## Cleanup

After testing, clean up test data:

```sql
-- Delete test products
DELETE FROM product_groups WHERE name LIKE '%Test Product%';

-- Or delete by specific IDs
DELETE FROM product_groups WHERE id IN ('<id1>', '<id2>', ...);
```

## Notes

- The database uses Neon's HTTP driver in development, which may have different transaction behavior than production
- All transactions should be atomic - either all operations succeed or all fail
- Error messages should not expose sensitive information
- All endpoints require admin authorization
