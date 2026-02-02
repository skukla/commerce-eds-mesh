/**
 * StoreConfig Resolver - Suite Release 5 (v3 dropins) compatibility
 *
 * Provides default values for StoreConfig fields that v3 dropins expect
 * but may not be present in all Adobe Commerce backend versions.
 *
 * These resolvers run after the backend data is fetched and fill in
 * missing fields with sensible defaults.
 */

module.exports = {
  StoreConfig: {
    // Printed card price - returns null/0 if not supported by backend
    printed_card_priceV2: {
      selectionSet: '{ printed_card_priceV2 { value currency } }',
      resolve: (root) => {
        // Return existing value if backend provides it
        if (root.printed_card_priceV2) {
          return root.printed_card_priceV2;
        }
        // Default: no printed card price
        return {
          value: 0,
          currency: 'USD',
        };
      },
    },

    // Gift options configuration fields
    allow_printed_card: {
      selectionSet: '{ allow_printed_card }',
      resolve: (root) => root.allow_printed_card ?? '0',
    },

    sales_printed_card: {
      selectionSet: '{ sales_printed_card }',
      resolve: (root) => root.sales_printed_card ?? '0',
    },

    sales_gift_wrapping: {
      selectionSet: '{ sales_gift_wrapping }',
      resolve: (root) => root.sales_gift_wrapping ?? '0',
    },

    gift_wrapping_available: {
      selectionSet: '{ gift_wrapping_available }',
      resolve: (root) => root.gift_wrapping_available ?? '0',
    },

    gift_receipt_available: {
      selectionSet: '{ gift_receipt_available }',
      resolve: (root) => root.gift_receipt_available ?? '0',
    },

    allow_gift_receipt: {
      selectionSet: '{ allow_gift_receipt }',
      resolve: (root) => root.allow_gift_receipt ?? '0',
    },

    allow_gift_wrapping: {
      selectionSet: '{ allow_gift_wrapping }',
      resolve: (root) => root.allow_gift_wrapping ?? '0',
    },

    cart_gift_wrapping: {
      selectionSet: '{ cart_gift_wrapping }',
      resolve: (root) => root.cart_gift_wrapping ?? '0',
    },

    cart_printed_card: {
      selectionSet: '{ cart_printed_card }',
      resolve: (root) => root.cart_printed_card ?? '0',
    },
  },
};
