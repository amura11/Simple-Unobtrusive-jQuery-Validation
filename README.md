jQuery.unobtrusive-validation, or shortened to JUVal, is a library that parses validation HTML data attributes created by the ASP.NET MVC framework into a standard configuration object that can then be adapted to be used with any client side validation plugin.

For more details see the [Wiki](https://github.com/amura11/jQuery.unobtrusive-validation/wiki)

# Current Client Side Validation Plugin Adaptors
* [jQuery Validate (being tested)](http://jqueryvalidation.org/)
* [Semantic UI (partially complete)](http://semantic-ui.com/behaviors/form.html)

# Usage
## Simple
1. Download the version for your validation plugin (jquery.uval.<plugin-name>.js)
2. Include it in your html file

##Advanced
1. Download jquery.uval.js
2. Include it in your html file
3. Add `UnobtrusiveValidation.setAdaptor('<plugin-name>');` somewhere in your code (don't put it in an event handler)
