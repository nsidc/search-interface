// Dummy transformer to prevent tests from dying when trying to import underscore templates.
const path = require('path');

module.exports = {
  process(sourceText, sourcePath, options) {
    return {
      code: `module.exports = ${JSON.stringify(path.basename(sourcePath))};`,
    }
  }
};
