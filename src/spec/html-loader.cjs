// Dummy transformer to prevent tests from dying when trying to import underscore templates.
const path = require('path');
const loader = require('jest-html-loader');

module.exports = {
  process(sourceText, sourcePath, options) {
    return {
      // code: `module.exports = ${JSON.stringify(path.extname(sourcePath))};`,
      code: `module.exports = ${loader(sourceText)};`,
    }
  }
};
