// Load environment variables
require('dotenv').config();

/**
 * EDS Commerce Mesh Configuration
 *
 * This mesh is optimized for Edge Delivery Services (EDS) storefronts:
 * - PASSTHROUGH: No prefix transforms (uses unprefixed operations like productSearch)
 * - CACHING: Response caching enabled for performance
 * - SIMPLE: Proxies Commerce GraphQL and Catalog Service directly
 *
 * For Headless/Next.js storefronts, use the headless-citisignal-mesh repo instead.
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
            // schemaHeaders are used during schema introspection at deployment time.
            // Without Store header, Commerce may return incomplete schema missing mutations.
            schemaHeaders: {
              'Content-Type': 'application/json',
              Store: '{env.ADOBE_COMMERCE_STORE_VIEW_CODE}',
            },
          },
        },
        // Filter out catalog queries - these come from CatalogService instead
        // This allows products(skus: ...) to route to Catalog Service for PDP dropin
        transforms: [
          {
            filterSchema: {
              filters: ['Query.!products', 'Query.!categories'],
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
        // NO transforms - products(skus: ...) and other Catalog Service queries
        // are exposed at root level for PDP/PLP dropins to work correctly.
        // Commerce's products/categories are filtered out above to avoid conflicts.
      },
    ],
    // NO filterSchema transform - EDS passes through all operations
    // additionalTypeDefs and additionalResolvers are added by build script if schema/resolvers exist
  },
};
