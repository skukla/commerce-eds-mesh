/**
 * Custom resolvers for API Mesh type coercion
 *
 * Handles type mismatches where Commerce returns a different type than
 * the GraphQL schema declares.
 *
 * Note: Resolvers must be applied to concrete types, not interfaces.
 * GraphQL Mesh resolves fields on the implementing types, not the interface itself.
 */

// Resolver for gift_message_available field - converts Boolean to String
const giftMessageResolver = {
  gift_message_available: {
    selectionSet: '{ gift_message_available }',
    resolve: (root) => {
      if (root.gift_message_available === null || root.gift_message_available === undefined) {
        return null;
      }
      return String(root.gift_message_available);
    },
  },
};

// All concrete product types that implement ProductInterface
const productTypes = [
  'SimpleProduct',
  'ConfigurableProduct',
  'BundleProduct',
  'DownloadableProduct',
  'GiftCardProduct',
  'GroupedProduct',
  'VirtualProduct',
];

// Apply the resolver to all product types
const resolvers = {};
productTypes.forEach((type) => {
  resolvers[type] = giftMessageResolver;
});

module.exports = resolvers;
