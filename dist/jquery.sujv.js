/**
 * jquery.unobtrusive-validation - A plugin to connect validation plugins with ASP.NET's unobtrusive validation attributes 
 * @version v0.4.1
 * @link https://github.com/amura11/jQuery.unobtrusive-validation#readme
 * @license MIT
 */
(function(Validation, $, undefined) {
    $(function() {
        Validation.setup();
    });

    Validation.setAdaptor = function(adaptorName) {
        _selectedAdaptor = adaptorName;
    };

    /**
     * Returns a namespace for the given adaptor
     * If the namespace doens't exist it gets created.
     * @param  {String} adaptorName The adaptor name to create a namespace for
     * @return {Object}             A namespace within Validation.Adaptors for the given adaptor name
     */
    Validation.getAdaptorNamespace = function(adaptorName) {
        Validation.Adaptors[adaptorName] = Validation.Adaptors[adaptorName] || {};

        return Validation.Adaptors[adaptorName];
    };

    Validation.setup = function(container) {
        var adaptor = Validation.Adaptors[_selectedAdaptor] || _emptyAdaptor;
        container = $(container || 'body');

        //If the container is a form run only on that form, else run on all child forms
        if (container.is('form')) {
            adaptor.initializePlugin(container, parseForm(container));
        } else {
            $('form', container).each(function() {
                var form = $(this);
                adaptor.initializePlugin(form, parseForm(form));
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
        $("[data-val='true']", form).each(function() {
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

        $.each(element[0].attributes, function() {
            var matchGroups;

            //If the attribute is specified and it's a rule attribute
            if (this.specified && (matchGroups = _ruleAttributeRegex.exec(this.name))) {
                //Get the match group for the actual rule data
                var ruleData = matchGroups[2];
                //Get the rule name and the paramter (if this is a parameter attribute)
                var ruleName = getRuleName(ruleData);
                var ruleParameter = getRuleParameter(ruleData);

                //If the element is a select or checkbox and the rule is required skip the rule
                //Since bools are non-nullable the required rule gets added but isn't valid
                if (ruleName === "required" && (element.is(':checkbox') || element.is('select')))
                    return;

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

    var _emptyAdaptor = {
        initializePlugin: function() {}
    };
    var _selectedAdaptor;
    var _ruleAttributeRegex = new RegExp(/^(data-val-)([\-a-zA-Z0-9]+)$/);
    //Ensure the adaptors namespace is setup
    Validation.Adaptors = Validation.Adaptors || {};
}(window.Validation = window.Validation || {}, jQuery));

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
}(Validation.getAdaptorNamespace('jQueryValidationPlugin'), jQuery));

(function(SemanticUi, $, undefined) {
    function init() {}

    /*
     * An adaptor for Semantic UIs validation plug-in (http://semantic-ui.com/behaviors/form.html)
     * Adapts the generic configuration into one that can be used by the validation plug-in
     */
    SemanticUi.initializePlugin = function(form, genericConfiguration) {

        var pluginConfiguration = {
            fields: {}
        };

        //Loop through each field
        for (var fieldName in genericConfiguration) {
            var fieldConfiguration = genericConfiguration[fieldName];
            var rules = [];

            for (var ruleName in fieldConfiguration) {
                var ruleConfiguration = fieldConfiguration[ruleName];
                var rule = {};
                var mapper = _mappers[ruleName] || parameterlessMapper.bind(this, ruleName);

                //Map the rule configuration to the plugin type and prompty
                rule.type = mapper(ruleConfiguration.parameters);
                rule.prompt = ruleConfiguration.message;

                //Add the rule to the field's list of rules
                rules.push(rule);
            }

            //Add an entry for the field
            pluginConfiguration.fields[fieldName] = {
                identifier: fieldName,
                rules: rules
            };
        }

        //Call Semantic UI's validation plug-in with the configuration
        form.form(pluginConfiguration);
    };

    /**
     * Adds a new rule mapper to the adaptor
     * @param {String} name            The name of the rule to be mapped
     * @param {Function} mappingFunction The function to perform the mapping. If empty paramters are passed through
     */
    SemanticUi.addRuleMapper = function(name, mappingFunction) {
        //If the mappingFunction is undefined, use the passthrough mapper
        _mappers[name] = mappingFunction || parameterlessMapper.bind(this, name);
    };

    /**
     * Adds a new rule to the validation plugin and adds a mapping for that rule
     * @param  {String} name               The name of the rule to be mapped
     * @param  {Function} validationFunction The function that acutally performs the validation
     */
    SemanticUi.addRule = function(name, validationFunction, mappingFunction) {
        //Add the function call-back
        $.fn.form.settings.rules[name] = validateFunction;

        //Add a mapper for the new rule
        _mappers[name] = mappingFunction || defaultMapper.bind(this, name);
    };

    function defaultMapper(name, parameters) {
        var toReturn;

        if (parameters.length > 0) {
            var parametersArray = [];

            for (var key in parameters) {
                parametersArray.push(parameters[key]);
            }

            toReturn = name + '[' + parametersArray.toString() + ']';
        } else {
            toReturn = name;
        }

        return toReturn;
    }

    function parameterlessMapper(name) {
        return name;
    }

    function singleParameterMapper(name, parameters) {
        if (Object.keys(parameters).length !== 1) {
            throw "Cannot pull a single value from a parameter list that has multiple parameters";
        }

        return name + '[' + parameters[Object.keys(configuration.parameters)[0]] + ']';
    }

    /**
     * @type {Object}
     */
    var _mappers = {
        //Default mapper calls with the name added
        creditcard: parameterlessMapper.bind(this, 'creditCard'),
        email: parameterlessMapper.bind(this, 'email'),
        required: parameterlessMapper.bind(this, 'empty'),
        url: parameterlessMapper.bind(this, 'url'),
        //Single value mappers with the name added
        equalto: singleParameterMapper.bind(this, 'match'),
        length: singleParameterMapper.bind(this, 'exactLength'),
        maxlength: singleParameterMapper.bind(this, 'maxLength'),
        minlength: singleParameterMapper.bind(this, 'minLength'),
        //Complex mappers
        regex: function(parameters) {
            return 'regExp[/' + parameters.pattern + '/]';
        },
        phone: function(parameters) {
            return 'regExp[/^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/]';
        },
        extension: function(parameters) {
            //TODO Need to create a rule for this
        },
        range: function(parameters) {
            return 'integer[' + parameters.min + '..' + parameters.max + ']';
        }
    };

    //Setup the adaptor
    init();
}(Validation.getAdaptorNamespace('SemanticUi'), jQuery));
