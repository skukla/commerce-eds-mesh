// Load environment variables
require('dotenv').config();

/**
 * EDS Commerce Mesh Configuration
 *
 * This mesh is optimized for Edge Delivery Services (EDS) storefronts:
 * - NATIVE: Catalog Service queries (productSearch, products, recommendations) pass through directly
 * - FILTERED: Commerce GraphQL filtered to cart/checkout operations (avoids conflicts)
 * - CACHING: Response caching enabled for performance
 *
 * For Headless/Next.js storefronts, use the headless-commerce-mesh repo instead.
 */
module.exports = {
  meshConfig: {
    // Enable response caching for EDS performance
    responseConfig: {
      cache: true,
      includeHTTPDetails: true,
      CORS: {
        credentials: true,
        exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Magento-Cache-Id'],
        maxAge: 60480,
        methods: ['GET', 'POST'],
        origin: '*',
      },
    },
    sources: [
      {
        name: 'CommerceGraphQL',
        handler: {
          graphql: {
            endpoint: '{env.ADOBE_COMMERCE_GRAPHQL_ENDPOINT}',
            operationHeaders: {
              'Content-Type': 'application/json',
              Store: "{context.headers['store']}",
            },
          },
        },
        // Filter Commerce to cart/checkout operations only
        // This avoids conflicts with Catalog Service queries (products, categories)
        transforms: [
          {
            filterSchema: {
              mode: 'bare',
              filters: [
                // Cart operations
                'Query.{cart, customerCart}',
                'Mutation.{createEmptyCart, addProductsToCart, removeItemFromCart, updateCartItems, applyCouponToCart, removeCouponFromCart, setShippingAddressesOnCart, setBillingAddressOnCart, setShippingMethodsOnCart, setPaymentMethodOnCart, placeOrder, mergeCarts}',
                // Customer operations
                'Query.{customer, customerOrders, isEmailAvailable}',
                'Mutation.{createCustomer, createCustomerV2, generateCustomerToken, revokeCustomerToken, updateCustomer, updateCustomerV2, changeCustomerPassword, requestPasswordResetEmail, resetPassword, createCustomerAddress, updateCustomerAddress, deleteCustomerAddress}',
                // Wishlist operations
                'Query.{wishlist}',
                'Mutation.{addProductsToWishlist, removeProductsFromWishlist}',
                // Store config (needed for currency, locale, etc.)
                'Query.{storeConfig, availableStores, countries, country, currency}',
                // CMS (needed for some EDS blocks)
                'Query.{cmsPage, cmsBlocks}',
              ],
            },
          },
        ],
      },
      {
        name: 'CatalogService',
        handler: {
          graphql: {
            endpoint: '{env.ADOBE_CATALOG_SERVICE_ENDPOINT}',
            operationHeaders: {
              'Content-Type': 'application/json',
              'Magento-Environment-Id': "{context.headers['magento-environment-id']}",
              'Magento-Website-Code': "{context.headers['magento-website-code']}",
              'Magento-Store-View-Code': "{context.headers['magento-store-view-code']}",
              'Magento-Store-Code': "{context.headers['magento-store-code']}",
              'Magento-Customer-Group': "{context.headers['magento-customer-group']}",
              'X-Api-Key': "{context.headers['x-api-key']}",
              Authorization: "{context.headers['Authorization']}",
            },
            schemaHeaders: {
              'x-api-key': '{env.ADOBE_CATALOG_API_KEY}',
              'Magento-Environment-Id': '{env.ADOBE_COMMERCE_ENVIRONMENT_ID}',
              'Magento-Website-Code': '{env.ADOBE_COMMERCE_WEBSITE_CODE}',
              'Magento-Store-View-Code': '{env.ADOBE_COMMERCE_STORE_VIEW_CODE}',
              'Magento-Store-Code': '{env.ADOBE_COMMERCE_STORE_CODE}',
            },
          },
        },
        // NO transform - native passthrough for EDS drop-ins
        // Exposes: productSearch, products, recommendations, etc.
      },
      {
        name: 'LiveSearch',
        handler: {
          graphql: {
            endpoint: '{env.ADOBE_CATALOG_SERVICE_ENDPOINT}',
            operationHeaders: {
              'Content-Type': 'application/json',
              'Magento-Environment-Id': "{context.headers['magento-environment-id']}",
              'Magento-Website-Code': "{context.headers['magento-website-code']}",
              'Magento-Store-View-Code': "{context.headers['magento-store-view-code']}",
              'Magento-Store-Code': "{context.headers['magento-store-code']}",
              'Magento-Customer-Group': "{context.headers['magento-customer-group']}",
              'X-Api-Key': 'search_gql',
            },
            schemaHeaders: {
              'x-api-key': '{env.ADOBE_CATALOG_API_KEY}',
              'Magento-Environment-Id': '{env.ADOBE_COMMERCE_ENVIRONMENT_ID}',
              'Magento-Website-Code': '{env.ADOBE_COMMERCE_WEBSITE_CODE}',
              'Magento-Store-View-Code': '{env.ADOBE_COMMERCE_STORE_VIEW_CODE}',
              'Magento-Store-Code': '{env.ADOBE_COMMERCE_STORE_CODE}',
              'X-Api-Key': 'search_gql',
            },
          },
        },
        // NO transform - native passthrough for EDS drop-ins
        // Exposes: productSearch (with AI ranking), attributeMetadata, etc.
      },
    ],
  },
};
