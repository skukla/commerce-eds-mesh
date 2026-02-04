/**
 * Custom resolvers for API Mesh type coercion and schema extensions
 *
 * Handles:
 * 1. Type mismatches (e.g., Boolean to String conversion)
 * 2. Missing fields on Commerce backends that lack certain modules
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

// Resolvers for StoreConfig fields that may not exist on all Commerce backends
// These fields are queried by EDS storefront dropins but require specific modules
const storeConfigResolver = {
  share_active_segments: {
    resolve: () => false,
  },
  graphql_share_customer_group: {
    resolve: () => false,
  },
  share_applied_cart_rule: {
    resolve: () => false,
  },
};

// Resolver for OrderTotal.grand_total_excl_tax (requires tax module)
// Returns null Money object when field doesn't exist on backend
const orderTotalResolver = {
  grand_total_excl_tax: {
    selectionSet: '{ grand_total { value currency } }',
    resolve: (root) => {
      // Fall back to grand_total if excl_tax not available
      return root.grand_total || { value: 0, currency: 'USD' };
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

// Apply StoreConfig resolvers for missing fields
resolvers.StoreConfig = storeConfigResolver;

// Apply OrderTotal resolver for grand_total_excl_tax
resolvers.OrderTotal = orderTotalResolver;

module.exports = resolvers;
