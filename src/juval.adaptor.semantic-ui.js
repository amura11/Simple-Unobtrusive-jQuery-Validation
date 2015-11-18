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
