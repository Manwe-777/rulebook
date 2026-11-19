/**
 * Libraries split into their own chunks, so a deploy that only changes app code keeps them cached in browsers, and
 * tool-db (only needed for the relays and editing) stays out of the first load.
 */
export const vendorChunks = {
  groups: [
    { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler|cookie|set-cookie-parser)[\\/]/ },
    {
      name: 'markdown',
      test: /node_modules[\\/](react-markdown|remark-.*|micromark.*|mdast-.*|hast-.*|unist-.*|unified|vfile.*|property-information|space-separated-tokens|comma-separated-tokens|html-url-attributes|decode-named-character-reference|character-entities.*|estree-util-.*|style-to-.*|inline-style-parser|zwitch|ccount|devlop|bail|trough|is-plain-obj|longest-streak|trim-lines|extend)[\\/]/,
    },
    { name: 'rules', test: /node_modules[\\/](zod|yaml)[\\/]/ },
    { name: 'tool-db', test: /node_modules[\\/](tool-db|@noble|@tool-db)[\\/]/ },
  ],
};
