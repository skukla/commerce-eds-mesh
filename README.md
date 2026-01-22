# Commerce EDS Mesh

Adobe API Mesh configuration optimized for **Edge Delivery Services (EDS)** Commerce storefronts.

## Overview

This mesh provides a **native passthrough configuration** for EDS storefronts that:

- **Native Catalog Service** - `productSearch`, `products`, `recommendations` pass through directly (no transforms)
- **Filtered Commerce GraphQL** - Cart, checkout, and customer operations only (avoids query conflicts)
- **Response caching enabled** - Optimized for EDS performance requirements
- **No custom resolvers** - EDS drop-ins call Catalog Service queries natively

## When to Use This Mesh

| Storefront Type                  | Mesh Repository                 | Operations Format                                  |
| -------------------------------- | ------------------------------- | -------------------------------------------------- |
| **EDS (Edge Delivery Services)** | `commerce-eds-mesh` (this repo) | `productSearch`, `products`, etc.                  |
| **Headless (Next.js, React)**    | `headless-citisignal-mesh`      | `Catalog_productSearch`, `Commerce_products`, etc. |

EDS dropins expect **unprefixed** GraphQL operations. This mesh ensures compatibility.

## Quick Start

```bash
# Install dependencies
npm install

# Build mesh.json from mesh.config.js
npm run build

# Create mesh in Adobe I/O (first time)
npm run create

# Update existing mesh
npm run update
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Commerce GraphQL endpoint
ADOBE_COMMERCE_GRAPHQL_ENDPOINT=https://your-store.com/graphql

# Catalog Service endpoint
ADOBE_CATALOG_SERVICE_ENDPOINT=https://catalog-service.adobe.io/graphql

# Catalog Service credentials
ADOBE_CATALOG_API_KEY=your-api-key
ADOBE_COMMERCE_ENVIRONMENT_ID=your-environment-id
ADOBE_COMMERCE_WEBSITE_CODE=base
ADOBE_COMMERCE_STORE_VIEW_CODE=default
ADOBE_COMMERCE_STORE_CODE=main_website_store
```

### Mesh Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Mesh (EDS)                          │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ CommerceGraphQL  │  │  CatalogService  │  │ LiveSearch │ │
│  │ (filtered)       │  │  (passthrough)   │  │(passthrough│ │
│  │ cart, checkout,  │  │  productSearch,  │  │            │ │
│  │ customer, etc.   │  │  products, recs  │  │            │ │
│  └────────┬─────────┘  └────────┬─────────┘  └─────┬──────┘ │
│           │                     │                   │        │
│           └─────────────────────┼───────────────────┘        │
│                                 │                            │
│              Response Caching Enabled                        │
│                                 │                            │
└─────────────────────────────────┼────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │       EDS Drop-ins        │
                    │  (native, unprefixed)     │
                    └───────────────────────────┘
```

**Query Routing:**

- Product queries (`productSearch`, `products`, `recommendations`) → CatalogService/LiveSearch
- Cart/Checkout queries (`cart`, `addProductsToCart`, `placeOrder`) → CommerceGraphQL
- Customer queries (`customer`, `generateCustomerToken`) → CommerceGraphQL

## Comparison with Headless Mesh

| Feature          | EDS Mesh    | Headless Mesh                      |
| ---------------- | ----------- | ---------------------------------- |
| Prefixes         | None        | `Commerce_`, `Catalog_`, `Search_` |
| Caching          | Enabled     | Optional                           |
| Custom Resolvers | None        | Citisignal-specific                |
| Custom Schema    | None        | Extended types                     |
| Target           | EDS dropins | Next.js/React apps                 |

## Scripts

- `npm run build` - Generate mesh.json from mesh.config.js
- `npm run create` - Build and create new mesh
- `npm run update` - Build and update existing mesh
- `npm run status` - Check mesh deployment status
- `npm run describe` - Show mesh configuration details

## Related Repositories

- **[headless-citisignal-mesh](https://github.com/skukla/headless-citisignal-mesh)** - Prefixed mesh for Headless storefronts

## License

Private - All rights reserved
