### What is this?

This is a plugin for serverless which allows a user to specify an entire
js file for import.

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
```

Any function properties are resolved on require if you attempt to access through a function. For example if you are returning a function, then referencing a property, the plugin with resolve the function and expect an object with your given property else you will enjoy an error.
