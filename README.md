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

###Credit Card Attribute
C# | HTML5 
--- | --- 
[`CreditCard`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.creditcardattribute(v=vs.110).aspx) | `data-val-creditcard`
####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
String | `ErrorMessage=` | `data-val-creditcard` | The message to be displayed if the field is invalid
####Generic Configuration
```javascript
creditcard :{
  message: <data-val-creditcard>,
  parameters: undefined
}
```

###Regex Attribute
C# | HTML5 
--- | --- 
[`RegularExpression`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.regularexpressionattribute(v=vs.110).aspx) | `data-val-regex`
####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
String | `ErrorMessage=` | `data-val-regex` | The message to be displayed if the field is invalid
String | `pattern` | `data-val-regex-pattern` | The regex pattern to validate against for field being tested
####Generic Configuration
```javascript
regex :{
  message: <data-val-regex>,
  parameters: {
    pattern: <data-val-regex-pattern>
  }
}
```

###Length Attribute
C# | HTML5 
--- | --- 
[`StringLength`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.stringlengthattribute%28v=vs.110%29.aspx?f=255&MSPPError=-2147217396) | `data-val-length`
####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
String | `ErrorMessage=` | `data-val-length` | The message to be displayed if the field is invalid
Number | `maximumLength` | `data-val-length-max` | The maximum length of the field being tested
####Generic Configuration
```javascript
length :{
  message: <data-val-length>,
  parameters: {
    max: <data-val-length-max>
  }
}
```

###Max Length Attribute
C# | HTML5 
--- | --- 
[`MaxLength`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.maxlengthattribute(v=vs.110).aspx) | `data-val-maxlength`
####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
String | `ErrorMessage=` | `data-val-maxlength` | The message to be displayed if the field is invalid
Number | `length` | `data-val-maxlength-max` | The maximum length of the field being tested
####Generic Configuration
```javascript
maxlength :{
  message: <data-val-maxlength>,
  parameters: {
    max: <data-val-maxlength-max>
  }
}
```

###Min Length Attribute
C# | HTML5 
--- | --- 
[`MinLength`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.minlengthattribute(v=vs.110).aspx) | `data-val-minlength`
####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
String | `ErrorMessage=` | `data-val-minlength` | The message to be displayed if the field is invalid
Number | `length` | `data-val-minlength-min` | The minimum length of the field being tested
####Generic Configuration
```javascript
minlength :{
  message: <data-val-minlength>,
  parameters: {
    max: <data-val-minlength-min>
  }
}
```

###Range Attribute
C# | HTML5 
--- | --- 
[`Range`](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations.rangeattribute(v=vs.110).aspx) | `data-val-range`
####Parameters
Type | C# | HTML5 | Remarks
--- | --- | --- | ---
String | `ErrorMessage=` | `data-val-range` | The message to be displayed if the field is invalid
Number | `minimum` | `data-val-range-min` | The minimum value of the field being tested
Number | `maximum` | `data-val-range-max` | The maximum value of the field being tested
####Generic Configuration
```javascript
range :{
  message: <data-val-range>,
  parameters: {
    min: <data-val-range-min>,
    max: <data-val-range-max>
  }
}
```
