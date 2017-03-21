# Serverless Plugin - Import .js

[![Build Status](https://travis-ci.org/lteacher/serverless-plugin-js-import.svg?branch=master)](https://travis-ci.org/lteacher/serverless-plugin-js-import)
[![Coverage Status](https://coveralls.io/repos/github/lteacher/serverless-plugin-js-import/badge.svg?branch=master)](https://coveralls.io/github/lteacher/serverless-plugin-js-import?branch=master)
[![npm version](https://badge.fury.io/js/serverless-plugin-js-import.svg)](https://badge.fury.io/js/serverless-plugin-js-import)

### What is this?

This is a plugin for serverless which allows a user to specify an entire
js file for import. This could be useful for some plugin developer who wants to
provide a way for their users to import a config directly from js rather than
specifying a path.

### Why for?

Currently in the serverless yaml file you can only specify an import like

```yaml
custom:
  imported: ${file(./something.js):property}
```

In this instance `property` is required on the end of the `:` symbol and the `module.exports` must be a function. With this plugin, you can export whatever you want and it will be imported.

You can use the above syntax, or you can simply import with no syntax and just the file as follows

```yaml
custom:
  imported: ${file(./something.js)
  alsoImported: ${file(./something.js):thing
  stillImported: ${file(./something.js):thing.stuff.wow
```

Any function properties are resolved on require if you attempt to access through a function. For example if you are returning a function, then referencing a property, the plugin with resolve the function and expect an object with your given property else you will enjoy an error.
