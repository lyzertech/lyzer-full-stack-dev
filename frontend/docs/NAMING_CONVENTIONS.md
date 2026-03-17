# Naming Conventions Guide

## 📁 Folder/Directory Naming

### ✅ **Use lowercase with hyphens (kebab-case)**

```
✅ Good:
- warehouse/
- product-list/
- inventory-reports/
- file-manager/
- create-project/

❌ Bad:
- Warehouse/        (PascalCase)
- product_list/     (snake_case)
- ProductList/      (PascalCase)
- productList/      (camelCase)
```

### **Next.js App Router Structure:**

```
app/
  (components)/              ← Route groups (parentheses)
    (content-layout)/        ← Layout groups
      warehouse/             ← Feature module (lowercase)
        inventory/           ← Feature sub-module
          page.tsx           ← Next.js route file
        products/
          list/              ← Action/resource
            page.tsx
```

---

## 📄 File Naming

### **1. React Components (`.tsx` files)**

#### ✅ **Use PascalCase for component files**

```
✅ Good:
- Inventory.tsx
- ProductList.tsx
- AddProduct.tsx
- ProductHistory.tsx
- ListTable.tsx

❌ Bad:
- inventory.tsx
- product-list.tsx
- addProduct.tsx
- product_history.tsx
```

#### **Component File Structure:**

```
FeatureName.tsx          ← Main feature component
FeatureNameList.tsx      ← List view component
FeatureNameForm.tsx      ← Form component
FeatureNameCard.tsx      ← Card component
FeatureNameTable.tsx     ← Table component
FeatureNameModal.tsx     ← Modal component
```

### **2. Next.js Route Files**

#### ✅ **Always lowercase: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`**

```
✅ Good:
- page.tsx
- layout.tsx
- loading.tsx
- error.tsx
- not-found.tsx

❌ Bad:
- Page.tsx
- Layout.tsx
- Page.tsx
```

### **3. Data/Utility Files**

#### ✅ **Use camelCase for data files and utilities**

```
✅ Good:
- inventorydata.tsx
- productdata.tsx
- warehousedata.tsx
- utils.ts
- helpers.ts
- constants.ts

❌ Bad:
- InventoryData.tsx
- product_data.tsx
- warehouse-data.tsx
```

### **4. Type/Interface Files**

#### ✅ **Use camelCase with descriptive suffix**

```
✅ Good:
- types.ts
- interfaces.ts
- inventorytypes.ts
- producttypes.ts

❌ Bad:
- Types.ts
- types.tsx
- inventory_types.ts
```

---

## 🎯 Component Naming Patterns

### **1. Main Feature Components**

```
FeatureName.tsx
- Inventory.tsx
- ProductList.tsx
- WarehouseDashboard.tsx
```

### **2. Sub-components (Feature-specific)**

```
FeatureName + Action/Type
- AddInventory.tsx
- InventoryReports.tsx
- InventoryHistory.tsx
- ProductList.tsx
- ProductForm.tsx
```

### **3. Reusable Components (in shared/)**

```
Spk + ComponentType + Purpose
- SpkBadge.tsx
- SpkTables.tsx
- SpkButton.tsx
- SpkDropdown.tsx
```

---

## 📂 Directory Structure Examples

### **Current Structure (Good ✅):**

```
app/(components)/(content-layout)/
  warehouse/
    inventory/
      page.tsx              ← Route entry
      Inventory.tsx         ← Main component
      AddInventory.tsx      ← Sub-component
      InventoryReports.tsx  ← Sub-component
      InventoryHistory.tsx  ← Sub-component
    products/
      list/
        page.tsx            ← Route entry
        ProductList.tsx     ← Main component
        ListTable.tsx       ← Sub-component
    dashboard/
      page.tsx
```

### **Alternative Structure (Also Good ✅):**

```
app/(components)/(content-layout)/
  warehouse/
    inventory/
      page.tsx
      components/           ← Group related components
        Inventory.tsx
        AddInventory.tsx
        InventoryReports.tsx
      data/
        inventorydata.tsx   ← Data/constants
```

---

## 🏗️ Module Placement Rules

### **Where to Create New Feature Modules**

When creating a **new feature module** (e.g., warehouse, inventory, reports), always place it in:

**📍 Location**: `app/(components)/(content-layout)/[module-name]/`

### **Examples**

```
✅ Correct Placement:
- Warehouse module → app/(components)/(content-layout)/warehouse/
- Inventory module → app/(components)/(content-layout)/inventory/
- Reports module  → app/(components)/(content-layout)/reports/
- Analytics       → app/(components)/(content-layout)/analytics/

❌ Incorrect Placement:
- app/warehouse/          (Missing route groups)
- app/components/warehouse/   (Wrong route group)
- app/(content-layout)/warehouse/   (Missing (components) group)
```

### **Standard Module Structure**

When requested to create a new module, use this structure:

```
app/(components)/(content-layout)/
  your-module/
    page.tsx                    ← Main dashboard/overview page
    [feature]/
      page.tsx                  ← Feature-specific page
      FeatureComponent.tsx      ← Feature components
    [another-feature]/
      page.tsx
    components/                 ← Module-specific shared components (optional)
      SharedComponent.tsx
```

### **Real-World Example: Warehouse Module**

```
app/(components)/(content-layout)/
  warehouse/
    page.tsx                    ← Warehouse dashboard (/warehouse)
    inventory/
      page.tsx                  ← Inventory list (/warehouse/inventory)
      InventoryList.tsx
      InventoryCard.tsx
    receiving/
      page.tsx                  ← Receiving page (/warehouse/receiving)
      ReceivingForm.tsx
    shipping/
      page.tsx                  ← Shipping page (/warehouse/shipping)
    components/                 ← Shared warehouse components
      WarehouseStats.tsx
      LocationPicker.tsx
```

### **Route Group Purpose**

- `(components)` - Groups all main application features
- `(content-layout)` - Applies shared header/sidebar layout
- **Both are required** for all feature modules

### **Existing Module Categories**

| Category | Path | Examples |
|----------|------|----------|
| **Dashboards** | `dashboards/[type]/` | `dashboards/ecommerce/`, `dashboards/crm/` |
| **School** | `school/[feature]/` | `school/attendance/`, `school/teacher/` |
| **Finance** | `finance/[feature]/` | `finance/transactions/` |
| **New Modules** | `[module-name]/[feature]/` | `warehouse/inventory/`, `reports/sales/` |

### **Quick Decision Tree**

```
Creating a new page?
  │
  ├─ Is it a new feature module? (e.g., warehouse, inventory)
  │    └─ ✅ Place in: app/(components)/(content-layout)/[module-name]/
  │
  ├─ Is it part of an existing module? (e.g., school, dashboards)
  │    └─ ✅ Place in: app/(components)/(content-layout)/[existing-module]/[feature]/
  │
  └─ Is it a special route? (auth, API, etc.)
       └─ ⚠️  Follow Next.js special file conventions
```

### **Related Templates**

- See [UI_TEMPLATES.md](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/docs/UI_TEMPLATES.md) for page templates
- See [UI_RULES.md](file:///u:/Full-Stack%20Dev%20Environment/lyzer-nextjs/docs/UI_RULES.md) for UI conventions

---

## 🔤 Variable & Function Naming

### **Variables: camelCase**

```typescript
✅ Good:
const productList = []
const inventoryRecords = []
const selectedCategory = 'Electronics'
const imageErrors = new Set()

❌ Bad:
const ProductList = []
const inventory_records = []
const SelectedCategory = 'Electronics'
```

### **Functions: camelCase with verb prefix**

```typescript
✅ Good:
const fetchProducts = async () => {}
const handleStatusChange = () => {}
const calculateStats = () => {}
const getProductsByCategory = () => {}

❌ Bad:
const FetchProducts = () => {}
const handle_status_change = () => {}
const CalculateStats = () => {}
```

### **Constants: UPPER_SNAKE_CASE**

```typescript
✅ Good:
const MAX_PRODUCTS = 100
const DEFAULT_CATEGORY = 'Electronics'
const API_BASE_URL = 'https://api.example.com'

❌ Bad:
const maxProducts = 100
const defaultCategory = 'Electronics'
```

---

## 🎨 Type/Interface Naming

### **Interfaces: PascalCase**

```typescript
✅ Good:
interface Product {}
interface InventoryRecord {}
interface Warehouse {}
interface InventoryStats {}

❌ Bad:
interface product {}
interface inventory_record {}
```

### **Types: PascalCase**

```typescript
✅ Good:
type InventoryStatus = 'InStock' | 'OutOfStock'
type ProductStatus = 'Active' | 'Inactive'
type UserRole = 'Admin' | 'Manager' | 'Staff'

❌ Bad:
type inventoryStatus = 'InStock' | 'OutOfStock'
type product_status = 'Active' | 'Inactive'
```

---

## 📋 File Organization Best Practices

### **1. One Component Per File**

```
✅ Good:
- Inventory.tsx (contains Inventory component)
- AddInventory.tsx (contains AddInventory component)

❌ Bad:
- Inventory.tsx (contains Inventory, AddInventory, Reports)
```

### **2. Related Files Together**

```
✅ Good:
warehouse/
  inventory/
    page.tsx
    Inventory.tsx
    AddInventory.tsx
    InventoryReports.tsx
    InventoryHistory.tsx

❌ Bad:
warehouse/
  inventory/
    page.tsx
  components/
    Inventory.tsx
  features/
    AddInventory.tsx
```

### **3. Data Files in Shared**

```
✅ Good:
shared/
  data/
    warehouse/
      inventorydata.tsx
      productdata.tsx
      warehousedata.tsx

❌ Bad:
app/(components)/warehouse/inventory/
  inventorydata.tsx
```

---

## 🚫 Common Mistakes to Avoid

### **1. Inconsistent Casing**

```
❌ Bad:
- warehouse/ProductList/page.tsx
- warehouse/product-list/Page.tsx
- warehouse/Product-List/page.tsx

✅ Good:
- warehouse/products/list/page.tsx
```

### **2. Mixing Naming Conventions**

```
❌ Bad:
- Inventory.tsx (component)
- inventory-data.tsx (data file)
- InventoryTypes.tsx (types)

✅ Good:
- Inventory.tsx (component)
- inventorydata.tsx (data file)
- inventorytypes.ts (types)
```

### **3. Unclear File Names**

```
❌ Bad:
- data.tsx
- utils.tsx
- component.tsx
- list.tsx

✅ Good:
- inventorydata.tsx
- warehouseutils.tsx
- InventoryList.tsx
- ProductList.tsx
```

---

## 📝 Quick Reference

| Type                | Convention           | Example                                 |
| ------------------- | -------------------- | --------------------------------------- |
| **Folders**         | lowercase-kebab-case | `product-list/`, `inventory-reports/`   |
| **Component Files** | PascalCase           | `Inventory.tsx`, `ProductList.tsx`      |
| **Route Files**     | lowercase            | `page.tsx`, `layout.tsx`                |
| **Data Files**      | camelCase            | `inventorydata.tsx`, `productdata.tsx`  |
| **Type Files**      | camelCase            | `inventorytypes.ts`, `types.ts`         |
| **Variables**       | camelCase            | `productList`, `selectedCategory`       |
| **Functions**       | camelCase            | `fetchProducts`, `handleClick`          |
| **Constants**       | UPPER_SNAKE_CASE     | `MAX_PRODUCTS`, `API_URL`               |
| **Interfaces**      | PascalCase           | `Product`, `InventoryRecord`            |
| **Types**           | PascalCase           | `InventoryStatus`, `UserRole`           |

---

## 🎯 Your Current Structure Analysis

### ✅ **What You're Doing Right:**

- ✅ Using lowercase for folders (`warehouse/`, `inventory/`, `products/`)
- ✅ Using PascalCase for components (`Inventory.tsx`, `ProductList.tsx`)
- ✅ Using lowercase for route files (`page.tsx`)
- ✅ Grouping related components together

### 🔧 **Recommendations:**

1. **Remove unnecessary files:**

   - `page copy.tsx` → Delete this duplicate
   - `col.tsx` → If unused, remove it

2. **Consider organizing sub-components:**

   ```
   products/list/
     page.tsx
     ProductList.tsx
     components/          ← Optional: if you have many sub-components
       ListTable.tsx
       ProductCard.tsx
   ```

3. **Data files location:**
   - Keep data files in `shared/data/warehouse/` for better organization

---

## 📚 Summary

**Golden Rules:**

1. **Folders** = lowercase-kebab-case
2. **Components** = PascalCase
3. **Routes** = lowercase (`page.tsx`)
4. **Data/Utils** = camelCase
5. **Types/Interfaces** = PascalCase
6. **Variables/Functions** = camelCase
7. **Constants** = UPPER_SNAKE_CASE

**Remember:** Consistency is key! Stick to one convention throughout your project.
