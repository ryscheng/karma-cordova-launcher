karma-cordova-launcher
======================

> Run your unit tests on Android, iOS, etc using [Apache Cordova](https://cordova.apache.org/)

## Installation

Install `karma-cordova-launcher` as a `devDependency` in your package.json:

```bash
npm install karma-cordova-launcher --save-dev
```

## Usage

This launcher is typically used to test your unit tests locally on a mobile device emulator.
It is expected that you are already familiar with Karma when configuring this launcher, so if you are new to Karma, head over to the [Karma website](http://karma-runner.github.io/).

### Adding karma-cordova-launcher to an existing Karma config

To configure this launcher, you need to add the `cordovaSettings` property to your top-level Karma config.
The `browsers` array needs to include `Cordova`.

The `cordovaSettings` object defines global settings for Cordova.
Here is a sample Karma config to get the launcher running:

```js
module.exports = function(config) {
  // Example set of mobile platforms to run on Cordova
  config.set({
    // The rest of your karma config is here
    // ...
    cordovaSettings: {
      platforms: ['android', 'ios'],
      plugins: [
        'org.apache.cordova.console'
      ]
    },
    browsers: ['Cordova'],
    reporters: ['dots', 'progress']
    singleRun: true
  });
};
```

### Example karma-cordova-launcher configs

For example configs using this launcher, check out the Grunt and Karma configuration for
[freedom-for-chrome](https://github.com/freedomjs/freedom-for-chrome)

## `cordovaSettings` config properties

### platforms 
Type: Array of `String`
Default: `[]`

An array of Cordova platforms to test on. For valid values, see
[Cordova Platform Support]{http://cordova.apache.org/docs/en/3.4.0/guide_support_index.md.html#Platform%20Support}

### plugins
Type: Array of `String`
Default: `[]`

An array of Cordova plugins to install. For valid plugins, see the
[Cordova Plugins Registry](http://plugins.cordova.io/#/)
