# jQuery.unobtrusive-validation
jQuery.unobtrusive-validation is a plug-in to allow any validation plug-in to be used with ASP.NET's unobtrusive validation attributes using a modular adaptor system. Each adaptor is a function that takes the generic configuration produced by the core jQuery.unobtrusive-validation code and turns it into options passed into a given validation plugin.

# Current Plug-in Adaptors
* [jQuery Validate (being tested)](http://jqueryvalidation.org/)
* [Semantic UI (partially complete)](http://semantic-ui.com/behaviors/form.html)

# Usage
1. Include the *jQuery.unobtrusive-validation.js* file
2. Include one or all of the validation adaptor files
3. Set the adaptor in code `UnobtrusiveValidation.setAdaptor('adaptorName');`

#Background Information

##Validation Attributes
(Work in progress, trying to create a list of [System.ComponentModel.DataAnnotations](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations%28v=vs.110%29.aspx?f=255&MSPPError=-2147217396) that can be used in MVC and Unobtrusive Validation)

###Credit Card
####Attributes
**C#:** [`CreditCard`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.creditcardattribute(v=vs.110).aspx)

**HTML 5:** `data-val-creditcard`

####Parameters
None

###Regex
####Attributes
**C#:** [`RegularExpression`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.regularexpressionattribute(v=vs.110).aspx)

**HTML 5:** `data-val-regex`
####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
String | `pattern` | `data-val-regex-pattern` | The regex pattern to validate against for field being tested

###Length
####Attributes
**C#:** [`StringLength`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.stringlengthattribute%28v=vs.110%29.aspx?f=255&MSPPError=-2147217396)

**HTML 5:** `data-val-length`
####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
Number | `maximumLength` | `data-val-length-max` | The maximum length of the field being tested

###Max Length
####Attributes
**C#:** [`MaxLength`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.maxlengthattribute(v=vs.110).aspx)

**HTML 5:** `data-val-maxlength`

####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
Number | `length` | `data-val-maxlength-max` | The maximum length of the field being tested

###Min Length
####Attributes
**C#:** [`MinLength`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.minlengthattribute(v=vs.110).aspx)

**HTML 5:** `data-val-minlength`

####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
Number | `length` | `data-val-minlength-min` | The minimum length of the field being tested

###Range
####Attributes
**C#:** [`Range`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.rangeattribute(v=vs.110).aspx)

**HTML 5:** `data-val-range`

####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
Number | `minimum` | `data-val-range-min` | The minimum value of the field being tested
Number | `maximum` | `data-val-range-max` | The maximum value of the field being tested
