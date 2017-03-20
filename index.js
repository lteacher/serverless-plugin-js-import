'use strict'

const _ = require('lodash');
const path = require('path');

module.exports = function(S) {
  class CustomVariables extends S.classes.Variables {
    constructor(S) {
      super(S);

      // Replace variables with this plugin
      S.variables = this;
    }

    getValueFromFile(variableString) {
      /* Taken from Upstream, double check this logic, maybe refactor */
      const matchedFileRefString = variableString.match(this.fileRefSyntax)[0];
      const referencedFileRelativePath = matchedFileRefString
        .replace(this.fileRefSyntax, (match, varName) => varName.trim());
      const referencedFileFullPath = path.join(this.serverless.config.servicePath,
        referencedFileRelativePath);
      let fileExtension = referencedFileRelativePath.split('.');
      fileExtension = fileExtension[fileExtension.length - 1];

      // Validate file exists
      if (!this.serverless.utils.fileExistsSync(referencedFileFullPath)) {
        return undefined;
      }
      /*---------------- END UPSTREAM -------------------------------*/

      // Process JS files
      if (fileExtension === 'js') {
        let jsExport = require(referencedFileFullPath); // eslint-disable-line global-require

        jsExport = this.resolveFunction(jsExport);

        // Split as ':' or '.' and drop the `file(..)` part
        const paths = _.compact(variableString.replace(this.fileRefSyntax, '').split(/:|\./));

        if (!_.isEmpty(paths)) {
          _.each(paths, (property) => {
            jsExport = this.resolveFunction(_.get(jsExport, property));
          });
        }

        if (_.isUndefined(jsExport)) {
          const errorMessage = [
            'Invalid variable syntax when referencing',
            ` file "${referencedFileRelativePath}".`,
            ' Check if your javascript is returning the correct data.',
          ].join('');
          throw new this.serverless.classes.Error(errorMessage);
        }

        return jsExport;
      } else {
        return super.getValueFromFile(variableString);
      }
    }

    // Resolves any function else returns the input
    resolveFunction(js) {
      return _.isFunction(js) ? this.resolveFunction(js()) : js;
    }
  }

  return new CustomVariables(S);
}
