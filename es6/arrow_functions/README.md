## Arrow Functions

Arrow functions, introduced in ES6, are anonymous functions which make use of lexical scoping. This means that they will "inherit" the scope from which they are called in.

**Note:** They are **not** a replacement for `function()`.

### Syntax
----

**Single line return function:**

ES5:

```javascript
function(a) {
	return a * 2;
}
```

ES6:

```javascript
(a) => a * 2;
```

**Standard function**

ES5:

```javascript
function(a, b) {
	...
}
```

ES6:

```javascript
(a, b) => {
	...
}
```

### Lexical Scoping
----

Typically with ES5, we would use `.bind()` or a `self = this` line to get over the pain of the `this` Object. With the lexical scoping of arrow functions in ES6, it's far simpler:

ES5:

```javascript
function FooCtrl (FooService) {
	var self = this;
	
	this.foo = 'Hello';
	
	FooService.doSomething(function(response) {
		self.foo = response;
	});
}
```

*Note the use of `self = this` to allow us to call `self` inside the Service's method*

ES6:

```javascript
function FooCtrl (FooService) {
	this.foo = 'Hello';
	
	FooService.doSomething((response) => this.foo = response);
}
```

*A lot simpler!*

**Note:** It's important to note that `this` is not bound to the arrow function, but rather the `this` value is fetched lexically from the scope it sits inside. Technically, it has no `this` at all.

