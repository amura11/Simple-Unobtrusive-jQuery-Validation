(function ($, undefined) {
    /*
     * An initializer for jQueryValidation (http://jqueryvalidation.org/)
     * Converts the generic configuration into one that can be used by the validation plugin
     */
    UnobtrusiveValidation.addPlugin('jQueryValidation', function (form, genericConfiguration) {
        //Remove any old validaiton
        if ($.validator != null) {
            form.removeData("validator")
                .removeData("unobtrusiveValidation");
        }

        var options = {
            rules: {},
            messages: {}
        };

        //Loop through each field
        for (var fieldName in genericConfiguration) {
            var fieldConfiguration = genericConfiguration[fieldName];

            //Add an entry for the field in the rules and messages
            options.rules[fieldName] = {};
            options.messages[fieldName] = {};

            for (var ruleName in fieldConfiguration) {
                var ruleConfiguration = fieldConfiguration[ruleName];

                //Get the framework name for this rule
                var frameworkRuleName = getFrameworkRuleName(ruleName);

                //Set the parameters to the mapped parameters
                options.rules[fieldName][frameworkRuleName] = getFrameworkRuleParameters(ruleName, ruleConfiguration.parameters);

                //If there is a message specified add it to the configuration
                if (ruleConfiguration.message) {
                    options.messages[fieldName][frameworkRuleName] = ruleConfiguration.message;
                }
            }
        }

        form.validate(options);
    });

    /*
     * If specified, maps the name from the attribute to the name in the framework
     * If not specified the original name is returned
     */
    function getFrameworkRuleName(ruleName) {
        return _ruleNameMappers[ruleName] || ruleName;
    }

    /*
     * Maps the parameters for the given rule into parameters the framework can use
     * If no mapper is specified the default is used
     * The key is the rule name specified in the attributes not the framework rule name
     */
    function getFrameworkRuleParameters(ruleName, ruleParameters) {
        var mappedParameters;
        var mapper = _ruleParametersMappers[ruleName];

        if (mapper && typeof (mapper) === "string") {
            mappedParameters = _ruleParametersMappers[mapper](ruleParameters);
        } else if (mapper && typeof (mapper) === "function") {
            mappedParameters = _ruleParametersMappers[ruleName](ruleParameters);
        } else {
            mappedParameters = _ruleParametersMappers['__default'](ruleParameters);
        }

        return mappedParameters;
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
