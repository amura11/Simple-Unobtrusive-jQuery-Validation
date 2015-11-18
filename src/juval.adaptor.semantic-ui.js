(function(SemanticUi, $, undefined) {
    function init() {
    }

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
