jQuery.unobtrusive-validation is a library that parses validation HTML data attributes created by the ASP.NET MVC framework into a standard configuration object that can then be adapted to be used with any client side validation plugin. 

For more details see the [Wiki](https://github.com/amura11/jQuery.unobtrusive-validation/wiki)

# Current Client Side Validation Plugin Adaptors
* [jQuery Validate (being tested)](http://jqueryvalidation.org/)
* [Semantic UI (partially complete)](http://semantic-ui.com/behaviors/form.html)

# Usage
1. Include the *jQuery.unobtrusive-validation.js* file
2. Include one or all of the validation adaptor files
3. Set the adaptor in code `UnobtrusiveValidation.setAdaptor('adaptorName');`
