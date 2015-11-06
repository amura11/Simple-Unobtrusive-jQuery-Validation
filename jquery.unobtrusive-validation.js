(function (UnobtrusiveValidation, $, undefined) {
    $(function () {
        UnobtrusiveValidation.setup();
    });

    var _pluginInitializers = {};
    var _plugin = "";
    var _ruleAttributeRegex = new RegExp(/^(data-val-)([\-a-zA-Z0-9]+)$/);
    UnobtrusiveValidation.usePlugin = function (pluginName) {
        _plugin = pluginName;
    }

    UnobtrusiveValidation.addPlugin = function (pluginName, initializeCallback) {
        _pluginInitializers[pluginName] = initializeCallback;
    }

    UnobtrusiveValidation.setup = function (container) {
        container = $(container || 'body');

        //If the container is a form run only on that form, else run on all child forms
        if (container.is('form')) {
            _pluginInitializers[_plugin](container, parseForm(container));
        }
        else {
            $('form', container).each(function () {
                var form = $(this);
                _pluginInitializers[_plugin](form, parseForm(form));
            });
        }
    }

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
        var ruleParameter = undefined;

        var index = ruleAttribute.indexOf('-');

        if (index > 0) {
            ruleParameter = ruleAttribute.substr(index + 1);
        }

        return ruleParameter;
    }
}(window.UnobtrusiveValidation = window.UnobtrusiveValidation || {}, jQuery));
