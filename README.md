# myTpl.js
Simple template engine with limited logic written in Javascript. A version written in PHP can be found [here](http://github.com/myuce/myTpl.php).

# Usage

```javascript
var tpl = myTpl('tplDir');
var data = {"name": "John Doe"};
tpl.load("test","myDiv",data);
```

# Template file

```html
Hello! My name is {%name}.
```

And the result should look like this:

```html
Hello! My name is John Doe.
```

The test files can be checked for futher examples.
