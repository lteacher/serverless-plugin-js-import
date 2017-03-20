'use strict'

const async = require('async');
const expect = require('chai').expect;
const Serverless = require('serverless');
const tmp = require('tmp');
const fs = require('fs-extra');
const path = require('path');
const sinon = require('sinon');
const sinonTest = require('sinon-test');
const Plugin = require('../');

sinon.test = sinonTest.configureTest(sinon);

describe('CustomVariables Plugin', () => {

  describe('#constructor()', () => {

    it('should replace the default Variables class', () => {
      const serverless = new Serverless();

      expect(serverless.variables).to.be.an.instanceof(serverless.classes.Variables);
      expect(serverless.variables.constructor.name).to.not.equal('CustomVariables');
      serverless.pluginManager.addPlugin(Plugin);
      expect(serverless.variables).to.be.an.instanceof(serverless.classes.Variables);
      expect(serverless.variables.constructor.name).to.equal('CustomVariables');
    });
  });

  describe('#getValueFromFile()', () => {

    it('should call the super method for non-js types', sinon.test(function() {
      const serverless = new Serverless();
      const tmpDirPath = tmp.dirSync().name;
      const jsData = 'module.exports = { hello: "hello world" }';

      fs.writeFileSync(path.join(tmpDirPath, 'someFile'), 'hello world');

      serverless.pluginManager.addPlugin(Plugin);
      serverless.config.update({ servicePath: tmpDirPath });

      let getValueFromFileSpy = this.spy(serverless.classes.Variables.prototype, 'getValueFromFile');

      const valueToPopulate = serverless.variables.getValueFromFile('file(./someFile)');
      expect(valueToPopulate).to.equal('hello world');
      expect(getValueFromFileSpy.called).to.be.ok;
      fs.removeSync(tmpDirPath);
    }));

    it('should return undefined for missing file', sinon.test(function() {
      const serverless = new Serverless();

      serverless.pluginManager.addPlugin(Plugin);
      serverless.config.update({ servicePath: '/irrelevant/location' });

      const valueToPopulate = serverless.variables.getValueFromFile('file(./someFilez.js)');
      expect(valueToPopulate).to.equal(undefined);
    }));

    // Test the scenario `file(...js)`
    it('should populate from the `module.exports` of a javascript file', () => {
      const serverless = new Serverless();
      const tmpDirPath = tmp.dirSync().name;
      const jsData = 'module.exports = { hello: "hello world" }';

      fs.writeFileSync(path.join(tmpDirPath, 'hello.js'), jsData);

      serverless.pluginManager.addPlugin(Plugin);
      serverless.config.update({ servicePath: tmpDirPath });

      const valueToPopulate = serverless.variables
        .getValueFromFile('file(./hello.js)');
      expect(valueToPopulate).to.eql({ hello: 'hello world' });
      fs.removeSync(tmpDirPath);
    });

    // Tests the scenario `file(...js):export`
    it('should populate from the `export.name` of a javascript file', () => {
      const serverless = new Serverless();
      const tmpDirPath = tmp.dirSync().name;
      const jsData = 'module.exports = { hello: "hello world" }';

      fs.writeFileSync(path.join(tmpDirPath, 'hello.js'), jsData);

      serverless.pluginManager.addPlugin(Plugin);
      serverless.config.update({ servicePath: tmpDirPath });

      const valueToPopulate = serverless.variables
        .getValueFromFile('file(./hello.js):hello');
      expect(valueToPopulate).to.equal('hello world');
      fs.removeSync(tmpDirPath);
    });

    // Tests the scenario `file(...js):export.prop`
    it('should populate from the `export.name.prop` of a javascript file', () => {
      const serverless = new Serverless();
      const tmpDirPath = tmp.dirSync().name;
      const jsData = `module.exports.hello=function(){
        return {one:{two:{three: 'hello world'}}}
      };`;

      fs.writeFileSync(path.join(tmpDirPath, 'hello.js'), jsData);

      serverless.pluginManager.addPlugin(Plugin);
      serverless.config.update({ servicePath: tmpDirPath });

      const valueToPopulate = serverless.variables
        .getValueFromFile('file(./hello.js):hello.one.two.three');
      expect(valueToPopulate).to.equal('hello world');
      fs.removeSync(tmpDirPath);
    });

    // Tests the scenario `file(...js)` where a function is returned
    it('should respect the type of the javascript export on evaluation', () => {
      const serverless = new Serverless();
      const tmpDirPath = tmp.dirSync().name;
      const jsData = 'module.exports=function(){return "hello world";};';

      fs.writeFileSync(path.join(tmpDirPath, 'hello.js'), jsData);

      serverless.pluginManager.addPlugin(Plugin);
      serverless.config.update({ servicePath: tmpDirPath });

      const valueToPopulate = serverless.variables
        .getValueFromFile('file(./hello.js)');
      expect(valueToPopulate).to.equal('hello world');
      fs.removeSync(tmpDirPath);
    });

    it('should throw an error for unresolvable variables', () => {
      const serverless = new Serverless();
      const tmpDirPath = tmp.dirSync().name;
      const jsData = 'module.exports=function(){return "hello world";};';

      fs.writeFileSync(path.join(tmpDirPath, 'hello.js'), jsData);

      serverless.pluginManager.addPlugin(Plugin);
      serverless.config.update({ servicePath: tmpDirPath });

      expect(() => serverless.variables
        .getValueFromFile('file(./hello.js):hello.someone')).to.throw(Error);
      fs.removeSync(tmpDirPath);
    });
  });
});
