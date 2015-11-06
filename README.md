# jQuery.unobtrusive-validation
jQuery.unobtrusive-validation is a plguin to allow any validation plugin to be used with ASP.NET's unobtrsuive validaiton attributes. The plguin parses these attributes into a generic object structure that is then passed to an adaptor that creates a plugin specific configuration.

# Current Plugin Adaptors
* [jQuery Validate (being tested)](http://jqueryvalidation.org/)
* [Semantic UI (partially complete)](semantic-ui.com/behaviors/form.html)

# Usage
1. Include the *jQuery.unobtrusive-validation.js* file
2. Include one or all of the validation adaptor files
3. Set the adaptor in code `UnobtrusiveValidation.usePlugin('adaptorName');`
