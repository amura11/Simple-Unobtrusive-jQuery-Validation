(function ($, undefined) {
    /*
     * An initializer for jQueryValidation (http://jqueryvalidation.org/)
     * Converts the generic configuration into one that can be used by the validation plugin
     */
    UnobtrusiveValidation.addAdaptor('jQueryValidation', function (form, genericConfiguration) {
        //Remove any old validaiton
        if ($.validator != null) {
            form.removeData("validator")
                .removeData("unobtrusiveValidation");
        }

        var pluginConfiguration = {
            rules: {},
            messages: {}
        };

        //Loop through each field
        for (var fieldName in genericConfiguration) {
            var fieldConfiguration = genericConfiguration[fieldName];

            //Add an entry for the field in the rules and messages
            pluginConfiguration.rules[fieldName] = {};
            pluginConfiguration.messages[fieldName] = {};

            for (var ruleName in fieldConfiguration) {
                var ruleConfiguration = fieldConfiguration[ruleName];

                //Get the framework name for this rule
                var pluginRuleName = getPluginRuleName(ruleName);

                //Set the parameters to the mapped parameters
                pluginConfiguration.rules[fieldName][pluginRuleName] = getPluginRuleParameters(ruleName, ruleConfiguration.parameters);

                //If there is a message specified add it to the configuration
                if (ruleConfiguration.message) {
                    pluginConfiguration.messages[fieldName][pluginRuleName] = ruleConfiguration.message;
                }
            }
        }

        form.validate(pluginConfiguration);
    });

    /*
     * If specified, maps the name from the attribute to the name in the framework
     * If not specified the original name is returned
     */
    function getPluginRuleName(ruleName) {
        return _ruleNameMappers[ruleName] || ruleName;
    }

    /*
     * Maps the parameters for the given rule into parameters the plugin can use
     * If there is no parameter maper the defualt is used
     * If the paramter mapper is a string it uses that function (can be the name of another mapper or a regular function)
     * If the paramter mapper is a function that function is called
     */
    function getPluginRuleParameters(ruleName, ruleParameters) {
        var mapper = _ruleParametersMappers[ruleName] || _ruleParametersMappers['__default'];

        //If the mapper is a string find the function it's referencing or us default
        if (typeof (mapper) === "string") {
            mapper = _ruleParametersMappers[mapper] || _ruleParametersMappers['__default'];
        }

        return mapper(ruleParameters);
    }

    function defaultParameterMapper(parameters) {
        //If the parameters is empty that means the framework is expecting true
        return parameters || true;
    }

    function singleValueParameterMapper(parameters) {
        if (Object.keys(parameters).length !== 1) {
            throw "Cannot pull a single value from a parameter list that has multiple parameters";
        }

        //Return the value of the first key (the only value)
        return parameters[Object.keys(parameters)[0]];
    }

    function minMaxParameterMapper(parameters) {
        if (!parameters.min && !parameters.max) {
            throw "Cannot pull a single value from a parameter list that has multiple parameters";
        }

        //Return the value of the first key (the only value)
        return [parameters.min, parameters.length];
    }

    var _ruleNameMappers = {
        regex: 'pattern'
    };

    /*
     * A map of rule names to functions or strings
     * If a rule name maps to a function, the parameters from the attributes will be pass to that function to be parsed
     * If a rule maps to a string then that rule will call that mapper to perform it's rule mapping
     */
    var _ruleParametersMappers = {
        //Utility mappers
        __default: defaultParameterMapper,
        __singleValue: singleValueParameterMapper,
        __minMax: minMaxParameterMapper,
        //Custom mappers
        length: '__singleValue',
        minlength: '__singleValue',
        maxlength: '__singleValue',
        rangelength: '__minMax',
        min: '__singleValue',
        max: '__singleValue',
        range: '__minMax',
        equalTo: '__singleValue',
        remote: '__singleValue',
        accept: '__singleValue',
        extension: '__singleValue',
        regex: function (parameters) {
            return new RegExp(parameters.pattern);
        }
    };
})(jQuery);
