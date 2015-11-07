# jQuery.unobtrusive-validation
jQuery.unobtrusive-validation is a plug-in to allow any validation plug-in to be used with ASP.NET's unobtrusive validation attributes using a modular adaptor system. Each adaptor is a function that takes the generic configuration produced by the core jQuery.unobtrusive-validation code and turns it into options passed into a given validation plugin.

# Current Plug-in Adaptors
* [jQuery Validate (being tested)](http://jqueryvalidation.org/)
* [Semantic UI (partially complete)](http://semantic-ui.com/behaviors/form.html)

# Usage
1. Include the *jQuery.unobtrusive-validation.js* file
2. Include one or all of the validation adaptor files
3. Set the adaptor in code `UnobtrusiveValidation.setAdaptor('adaptorName');`
