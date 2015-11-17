(function($){
    /*
     * An adaptor for Semantic UIs validation plug-in (http://semantic-ui.com/behaviors/form.html)
     * Adapts the generic configuration into one that can be used by the validation plug-in
     */
    UnobtrusiveValidation.addAdaptor('Semantic-UI', function(form, genericConfiguration) {

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

                //Map the rule configuration to the framework type
                rule.type = getPluginRuleType(ruleName, ruleConfiguration);

                //If there is a message specified add it to the configuration
                if (ruleConfiguration.message) {
                    rule.prompt = ruleConfiguration.message;
                }

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
    });

    /*
     * Gets the rule type for the Semantic UI validation plug-in
     */
    function getPluginRuleType(name, configuration) {
        var type;

        //Get the mapper for this rule type
        var mapper = _pluginRuleMappers[name];

        //If the mapper is a function call it, if it's a string find that mapper, if it's not defined map the name without parameters
        if (mapper && typeof(mapper) === "string") {
            type = _pluginRuleMappers[mapper](configuration.parameters);
        } else if (mapper && typeof(mapper) === "function") {
            type = _pluginRuleMappers[name](configuration.parameters);
        } else {
            type = name;
        }

        return type;
    }

    /*
     * A map of rule names to functions or strings
     * If a rule name maps to a function, the parameters from the attributes will be pass to that function to be parsed
     * If a rule maps to a string then that rule will call that mapper to perform it's rule mapping
     */
    var _pluginRuleMappers = {
        required: function() {
            return empty;
        },
        range: function(parameters) {
            return "integer[" + parameters.min + ".." + parameters.max + "]";
        },
        length: function(parameters) {
            return "exactLength[" + parameters.length + "]";
        },
        minlength: function(parameters) {
            return "minLength[" + parameters.min + "]";
        },
        maxlength: function(parameters) {
            return "maxLength[" + parameters.max + "]";
        },
        regex: function(parameters) {
            return "regExp[/" + parameters.pattern + "/]";
        }
    };
}(jQuery));
