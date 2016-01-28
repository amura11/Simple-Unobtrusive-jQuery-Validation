The Simple Unobtrusive jQuery Validation library is a lightweight, simple, and modular library designed to be the glue between the ASP.NET MVC framework's validation attributes and any jQuery based validation framework. The core of the library parses the ASP.NET validation attributes into a standard configuration which is then passed to a client side validation adaptor. The modular adaptors parse the standard configuration into a configuration that can be used by the client side validation framework. Since the adaptors are modular only the adaptor that is designed for your client side validation framework needs to be included. The goal of the project is to give developers a choice of client side validation frameworks.

For more details see the [Wiki](https://github.com/amura11/jQuery.unobtrusive-validation/wiki)

# Current Client Side Validation Framework Adaptors
* [jQuery Validate](http://jqueryvalidation.org/)
* [Semantic UI](http://semantic-ui.com/behaviors/form.html) Note: This is still a work in progress but mostly works

# Usage
## Simple
1. Download the version for your validation plugin (jquery.uval.<plugin-name>.js)
2. Include it

##Advanced
1. Download jquery.uval.js
2. Include it
3. Add `UnobtrusiveValidation.setAdaptor('<plugin-name>');` somewhere in your code (don't put it in an event handler)
