/**
 * query.unobtrusive-validation - A plugin to connect validation plugins with ASP.NET's unobtrusive validation attributes 
 * @version v0.0.1
 * @link https://github.com/amura11/jQuery.unobtrusive-validation#readme
 * @license MIT
 */
(function(UnobtrusiveValidation, $, undefined) {
    "use strict";

    $(function () {
        UnobtrusiveValidation.setup();
    });

    UnobtrusiveValidation.setAdaptor = function (adaptorName) {
        _selectedPluginAdaptor = _pluginAdaptors[adaptorName] || $.noop;
    };

    UnobtrusiveValidation.addAdaptor = function (adaptorName, adaptorFunction) {
        _pluginAdaptors[adaptorName] = adaptorFunction;
    };

    UnobtrusiveValidation.setup = function (container) {
        container = $(container || 'body');

        //If the container is a form run only on that form, else run on all child forms
        if (container.is('form')) {
            _selectedPluginAdaptor(container, parseForm(container));
        }
        else {
            $('form', container).each(function () {
                var form = $(this);
                _selectedPluginAdaptor(form, parseForm(form));
            });
        }
    };

    /*
     * Parses the given form and returns a generic configuration for that form
     * The generic configuration is passed to a plugin initialize and transformed into options that plugin can use
     */
    function parseForm(form) {
        var formConfig = {};

        //Build the list of validators for each field
        $("[data-val='true']", form).each(function () {
            var element = $(this);
            formConfig[element.attr('name')] = parseElement(element);
        });

        return formConfig;
    }

    /*
    * Parses the given element and returns a generic configuration for that element
    * The generic configuration looks as follows
    * {
    *   rule_name_1: {
    *       message: undefined|string,
    *       parameters: undefined|object
    *   },
    *   ...
    * }
    */
    function parseElement(element) {
        var elementConfig = {};

        $.each(element[0].attributes, function () {
            var matchGroups;

            //If the attribute is specified and it's a rule attribute
            if (this.specified && (matchGroups = _ruleAttributeRegex.exec(this.name))) {
                //Get the match group for the actual rule data
                var ruleData = matchGroups[2];
                //Get the rule name and the paramter (if this is a parameter attribute)
                var ruleName = getRuleName(ruleData);
                var ruleParameter = getRuleParameter(ruleData);

                //If we don't already have a rule object create it
                if (!elementConfig[ruleName]) {
                    elementConfig[ruleName] = {
                        message: undefined,
                        parameters: undefined
                    };
                }

                //If ruleParameter is defined that means this is a rule parameter attribute
                if (ruleParameter) {
                    //Setup the parameter object
                    if (!elementConfig[ruleName].parameters) {
                        elementConfig[ruleName].parameters = {};
                    }

                    //Add the paramter name and value
                    elementConfig[ruleName].parameters[ruleParameter] = this.value;
                } else {
                    //Set the message
                    elementConfig[ruleName].message = this.value;
                }
            }
        });

        return elementConfig;
    }

    /*
    * Utility for getting the rule name from the rule data
    * Eg. If the rule attribute is 'data-val-test-param-1'
    * Rule data would be: 'test-param-1'
    * Rule name would be: 'test'
    */
    function getRuleName(ruleAttribute) {
        var ruleName;

        var index = ruleAttribute.indexOf('-');

        if (index > 0) {
            ruleName = ruleAttribute.substr(0, index);
        } else {
            ruleName = ruleAttribute;
        }

        return ruleName;
    }

    /*
    * Utility for getting the rule paramter from the rule data
    * Eg. If the rule attribute is 'data-val-test-param-1'
    * Rule data would be: 'test-param-1'
    * Rule paramter would be: 'param-1'
    */
    function getRuleParameter(ruleAttribute) {
        var ruleParameter;

        var index = ruleAttribute.indexOf('-');

        if (index > 0) {
            ruleParameter = ruleAttribute.substr(index + 1);
        }

        return ruleParameter;
    }

    var _pluginAdaptors = {};
    var _selectedPluginAdaptor = $.noop;
    var _ruleAttributeRegex = new RegExp(/^(data-val-)([\-a-zA-Z0-9]+)$/);

}(window.UnobtrusiveValidation = window.UnobtrusiveValidation || {}, jQuery));

(function($){
    /*
     * An initializer for jQueryValidation (http://jqueryvalidation.org/)
     * Converts the generic configuration into one that can be used by the validation plugin
     */
    UnobtrusiveValidation.addAdaptor('jQueryValidationPlugin', function (form, genericConfiguration) {
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
        var mapper = _ruleParametersMappers[ruleName] || _ruleParametersMappers.__default;

        //If the mapper is a string find the function it's referencing or us default
        if (typeof (mapper) === "string") {
            mapper = _ruleParametersMappers[mapper] || _ruleParametersMappers.__default;
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
}(jQuery));

/*
 * Initializes the juval plugin to use the jQuery Validaiton Plugin
*/
if(UnobtrusiveValidation){
    UnobtrusiveValidation.setAdaptor('jQueryValidationPlugin');
}
