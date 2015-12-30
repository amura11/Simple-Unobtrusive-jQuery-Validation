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
    UnobtrusiveValidation.Adaptors = UnobtrusiveValidation.Adaptors || {};
}(window.UnobtrusiveValidation = window.UnobtrusiveValidation || {}, jQuery));
