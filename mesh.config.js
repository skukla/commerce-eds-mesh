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
          },
        },
        // NO prefix transform - EDS uses unprefixed operations
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
        // Encapsulate to avoid conflicts with Commerce GraphQL
        // This groups Catalog Service operations under the Catalog type
        transforms: [
          {
            encapsulate: {
              applyTo: {
                query: true,
                mutation: false,
              },
            },
          },
        ],
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
        // Encapsulate to avoid conflicts with Commerce GraphQL
        transforms: [
          {
            encapsulate: {
              applyTo: {
                query: true,
                mutation: false,
              },
            },
          },
        ],
      },
    ],
    // NO filterSchema transform - EDS passes through all operations
    // additionalTypeDefs and additionalResolvers are added by build script if schema/resolvers exist
  },
};
