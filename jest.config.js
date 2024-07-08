module.exports = {
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|js?|tsx?|ts?|mjs?)$",
    transform: {
      "^.+\\.jsx?$": "babel-jest",
      "^.+\\.mjs$": "babel-jest",
    },
    testPathIgnorePatterns: [ "D:/Downloads/Y3S2/AF/Assignment 1/assignment-01-DharaneSegar/node_modules/"],
    moduleFileExtensions: ["js", "jsx", "mjs"],
    testTimeout: 60000,
    
  }