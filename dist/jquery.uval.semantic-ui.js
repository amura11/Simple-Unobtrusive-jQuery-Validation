/**
 * jquery.unobtrusive-validation - A plugin to connect validation plugins with ASP.NET's unobtrusive validation attributes 
 * @version v0.2.1
 * @link https://github.com/amura11/jQuery.unobtrusive-validation#readme
 * @license MIT
 */
(function(UnobtrusiveValidation, $, undefined) {
    $(function() {
        UnobtrusiveValidation.setup();
    });

    UnobtrusiveValidation.setAdaptor = function(adaptorName) {
        _selectedAdaptor = adaptorName;
    };

    /**
     * Returns a namespace for the given adaptor
     * If the namespace doens't exist it gets created.
     * @param  {String} adaptorName The adaptor name to create a namespace for
     * @return {Object}             A namespace within UnobtrusiveValidation.Adaptors for the given adaptor name
     */
    UnobtrusiveValidation.getAdaptorNamespace = function(adaptorName) {
        UnobtrusiveValidation.Adaptors[adaptorName] = UnobtrusiveValidation.Adaptors[adaptorName] || {};

        return UnobtrusiveValidation.Adaptors[adaptorName];
    };

    UnobtrusiveValidation.setup = function(container) {
        var adaptor = UnobtrusiveValidation.Adaptors[_selectedAdaptor] || _emptyAdaptor;
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
    UnobtrusiveValidation.Adaptors = UnobtrusiveValidation.Adaptors || {};
}(window.UnobtrusiveValidation = window.UnobtrusiveValidation || {}, jQuery));

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
}(UnobtrusiveValidation.getAdaptorNamespace('SemanticUi'), jQuery));

/*
 * Initializes the juval plugin to use the SemanticUi Plugin
 */
if (UnobtrusiveValidation) {
    UnobtrusiveValidation.setAdaptor('SemanticUi');
}
