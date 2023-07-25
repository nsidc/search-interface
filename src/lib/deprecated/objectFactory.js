/* jshint esversion: 6 */

// The objectFactory is for dependency injection.
//
// e.g.
//   // set the config in objectFactory to register modules
//   `objectFactory.setConfig({
//     'Animal': {
//       Ctor: Elephant
//     }
//   });
//   // create instance of a module that registered in objectFactory
//   objectFactory.createInstance('Animal'); // returns a new Elephant`
//
//  Note:
//  The objectFactory supports general module as well as Backbone Models, Views and Collections.
//  At present, special configration settings are required in order to use objectFactory to create
//  Backbone Model and Collection properly.(see 'register' function section for more details).

class objectFactory {
    initialize() {
        this.dependencies = {};
    }

    // `register` stores the dependencies(modules) into the variable dependencies.
    // Each is a modulename/module setting pair.
    //
    // Params:
    // * `name`: the dependency name to register (module name)
    // * `dependency`: the dependency settings including Ctor(required) and other optional
    //    settings such as default and preset options etc.
    //
    // e.g.
    // simple registration:
    //   `objectFactory.register('newmoduleName', newmodule});`
    // registration with options:
    //   `objectFactory.register('newModelName',
    //   {Ctor: newModel,
    //    configOptions: {
    //      // The 'defaultOptions' is a special case used only for Backbone Models.
    //      // These options will be passed in Backbone Model.defaults as default attributes.
    //      defaultOptions: {
    //        // default settings that goes to 'model.defaults' (used only for Backbone Models).
    //      },
    //      preset: {
    //        // initial options (except the settings for Backbone Model defaults) are set here
    //      }
    //    }
    //   });`
    // registration for Collection:
    //   `objectFactory.register('newCollectionName',
    //   {Ctor: newCollection,
    //    configOptions: {
    //      preset: {
    //        // initial options (except the settings for Backbone Model defaults) are set here
    //      }
    //    },
    //    // At preset, models has to be set to indicate this is a Backbone Collection
    //    models: {}
    //   });`
    register(name, dependency) {
        this.dependencies[name] = dependency;
    }

    getDependencies(name) {
        return this.dependencies[name];
    }

    getDefaultOptions(configOptions) {
        let opts = {};

        if (configOptions.defaultOptions) {
            opts.defaults = configOptions.defaultOptions;
        }

        return opts;
    }

    getPreset(configOptions) {
        return configOptions.preset || {};
    }

    // `createInstance` creates instance of the object type provided
    //
    // Params:
    // * `type`: the object type of the instance to create (module name)
    // * `options`: the options to set the instance, this is optional.
    //
    // Returns:
    //   The new instance created
    //
    // e.g.
    // simple creation:
    //   `createInstance('moduleName');`
    // creation with options:
    //   `createInstance('moduleName', {option1: value1, option2: value2...});`
    createInstance(type, options) {
        let combinedOptions, defaultOpts, presetOpt, ClassType = this.getDependencies(type);

        if(!ClassType) {
            throw new Error('Cannot create unregistered type \'' + type + '\'');
        }
        if(ClassType instanceof Function) {
            return new ClassType(options);
        }

        if(ClassType.configOptions) {
            defaultOpts = this.getDefaultOptions(ClassType.configOptions);
            presetOpt = this.getPreset(ClassType.configOptions);
        }

        combinedOptions = _.extend({}, options, defaultOpts, presetOpt);

        // if the models are set, indicates this is a collection
        if(ClassType.models) {
            combinedOptions.models = _.extend({}, options.models, ClassType.models);
        }

        // other backbone class or customized module
        return new ClassType.Ctor(combinedOptions);

    }

    // `setConfig` sets the configuration that used to store dependencies initial settings
    // and register each of them.
    //
    // Params:
    // * `currentConfig`: the list of the object_name and object_settings pairs
    setConfig(currentConfig) {
        _.each(currentConfig, function (value, key) {
            objectFactory.register(key, value);
        });
    }
}

