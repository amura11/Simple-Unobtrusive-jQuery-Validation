(function(jQueryValidationPlugin, $, undefined) {
    /**
     * Sets up the adaptor for the jQuery Validation Plugin
     * @return {[type]} [description]
     */
    function init() {
        //Check that the plugin has been added
        if (!$.validator) {
            throw "No validator found, please ensure the jQuery Validation Plugin has been added";
        }

        //The pattern method is in a seperate file called aditional-methods.js, log a message if it's missing
        if (!$.validator.methods.pattern) {
            console.log("The additonal methods file has not been included, not all validation methods will work");
        }
    }

    /**
     * Parses the standardConfiguration into a plugin specific configuration
     * Once the config has been parsed the plugin is run on the given form
     * @param  {jQuery Object} form                  The form to setup with the plguin
     * @param  {Object} standardConfiguration The configuration from the core
     */
    jQueryValidationPlugin.initializePlugin = function(form, standardConfiguration) {
        //Remove any old validaiton
        if ($.validator !== null) {
            form.removeData("validator")
                .removeData("unobtrusiveValidation");
        }

        var pluginConfiguration = {
            rules: {},
            messages: {}
        };

        //Loop through each field
        for (var fieldName in standardConfiguration) {
            var fieldConfiguration = standardConfiguration[fieldName];

            //Add an entry for the field in the rules and messages
            pluginConfiguration.rules[fieldName] = {};
            pluginConfiguration.messages[fieldName] = {};

            for (var ruleName in fieldConfiguration) {
                //Get the mapper from the mapper list, if one isn't defined use the passthrough mapper
                var mapper = _mappers[ruleName] || passthroughMapper.bind(this, ruleName);

                //Call the mapper function
                mapper($.extend({}, {
                    fieldName: fieldName,
                    form: form
                }, fieldConfiguration[ruleName]), pluginConfiguration.rules[fieldName], pluginConfiguration.messages[fieldName]);
            }
        }

        form.validate(pluginConfiguration);
    };

    /**
     * Adds a new rule mapper to the adaptor
     * @param {String} name            The name of the rule to be mapped
     * @param {Function} mappingFunction The function to perform the mapping. If empty paramters are passed through
     */
    jQueryValidationPlugin.addRuleMapper = function(name, mappingFunction) {
        //If the mappingFunction is undefined, use the passthrough mapper
        _mappers[name] = mappingFunction || passthroughMapper.bind(this, name);
    };

    /**
     * Adds a new rule to the validation plugin and adds a mapping for that rule
     * @param  {String} name               The name of the rule to be mapped
     * @param  {Function} validationFunction The function that acutally performs the validation
     */
    jQueryValidationPlugin.addRule = function(name, validationFunction) {
        //Add the function call-back
        $.validator.addMethod(name, validateFunction);

        //Add a mapper for the new rule
        _mappers[name] = passthroughMapper.bind(this, name);
    };

    /**
     * A utility mapper that maps the parameters 1-1 as the plugin parameters
     * @param  {String} ruleName      The name of the rule to be mapped
     * @param  {Object} configuration The Standard configuration returned from the core
     * @param  {Object} rules         The current field's rules object to me modified
     * @param  {Object} messages      The current field's messages object to me modified
     */
    function passthroughMapper(ruleName, configuration, rules, messages) {
        rules[ruleName] = configuration.parameters;
        messages[ruleName] = configuration.message;
    }

    /**
     * A utility mapper that maps 'true' as the plugin parameter
     * @param  {String} ruleName      The name of the rule to be mapped
     * @param  {Object} configuration The Standard configuration returned from the core
     * @param  {Object} rules         The current field's rules object to me modified
     * @param  {Object} messages      The current field's messages object to me modified
     */
    function booleanMapper(ruleName, configuration, rules, messages) {
        rules[ruleName] = true;
        messages[ruleName] = configuration.message;
    }

    /**
     * A utility mapper that maps the first parameter as the plugin parameters
     * @param  {String} ruleName      The name of the rule to be mapped
     * @param  {Object} configuration The Standard configuration returned from the core
     * @param  {Object} rules         The current field's rules object to me modified
     * @param  {Object} messages      The current field's messages object to me modified
     */
    function singleValueMapper(ruleName, configuration, rules, messages) {
        if (Object.keys(configuration.parameters).length !== 1) {
            throw "Cannot pull a single value from a parameter list that has multiple parameters";
        }

        rules[ruleName] = configuration.parameters[Object.keys(configuration.parameters)[0]];
        messages[ruleName] = configuration.message;
    }

    function getModelName(fieldName) {
        return fieldName.substr(0, fieldName.lastIndexOf(".") + 1);
    }

    function setModelName(fieldName, modelName) {
        var updatedFieldName = fieldName.substr(fieldName.lastIndexOf(".") + 1);

        if (modelName.length > 0){
            updatedFieldName = modelName + "." + updatedFieldName;
        }

        return updatedFieldName;
    }

    function escapeAttributeValue(value) {
        return value.replace(/([!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g, "\\$1");
    }

    /**
     * The set of mappers that are available by default in ASP.NET MVC
     * Each mapper takes the rule configuration, and a reference to the current fields rules and messages
     * Note the use of 'bind' is to curry functions
     * @type {Object}
     */
    var _mappers = {
        //Default mapper calls with the name added
        creditcard: booleanMapper.bind(this, 'creditcard'),
        email: booleanMapper.bind(this, 'email'),
        phone: booleanMapper.bind(this, 'phoneUS'),
        required: booleanMapper.bind(this, 'required'),
        url: booleanMapper.bind(this, 'url'),
        //Single value mappers with the name added
        length: singleValueMapper.bind(this, 'maxlength'),
        maxlength: singleValueMapper.bind(this, 'maxlength'),
        minlength: singleValueMapper.bind(this, 'minlength'),
        regex: singleValueMapper.bind(this, 'pattern'),
        //Complex mappers
        extension: function(configuration, rules, messages) {
            //Convert the comma seperated string to a pipe separated
            rules.accept = configuration.parameters.extension.replace(/\s*,\s*/g, '|');
            messages.accept = configuration.message;
        },
        range: function(configuration, rules, messages) {
            rules.min = configuration.parameters.min;
            rules.max = configuration.parameters.max;

            messages.min = configuration.message;
            messages.max = configuration.message;
        },
        equalto: function(configuration, rules, messages) {
            //Build the full property name of the other field
            var modelName = getModelName(configuration.fieldName);
            var otherFieldName = setModelName(configuration.parameters.other, modelName);

            rules.equalTo = $(':input[name='+ escapeAttributeValue(otherFieldName) +']', configuration.form)[0];
            messages.equalTo = configuration.message;
        }
    };

    //Setup the adaptor
    init();
}(UnobtrusiveValidation.getAdaptorNamespace('jQueryValidationPlugin'), jQuery));
