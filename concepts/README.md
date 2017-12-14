- [Compiler and Execution Phase](#compiler-and-execution-phase)
- [Hoisting](#hoisting)
- [Scope](#scope)
    * [Lexical Scope](#lexical-scope)
    * [Function Scope](#function-scope)
    * [Block Scope](#block-scope)
- [Prototype](#prototype)
- [This](#this)
- [Closure](#closure)
- [Map, Filter and Reduce](#map-filter-and-reduce)
- [Call, Apply and Bind](#call-apply-and-bind)

# Compiler and Execution Phase

When compiled, the compiler will recursively go through every function checking for variable declarations. A Scope manager will also keep track of which Scope these variables are declared in.

```javascript
var foo = 'bar'

function bar() {
  var foo = 'baz'
}

function baz(foo) {
  foo = 'bam'
  bam = 'yay'
}
```

_Compile Phase_

- The 1st `foo` as a variable declaration inside the `global` Scope
- The 2nd `foo` as a variable declaration inside the `bar()` Scope
- The 3rd `foo` as a variable declaration inside the `baz()` Scope. Because it's a parameter of a function, it will still be declared as a variable.

_Execution Phase (Lexical Scope)_

- Line 1 will become simply `foo = 'bar'` during the execution phase as it’s been declared
    - It will see `foo` and ask the Scope manager `Has the global Scope has ever heard of a variable called 'foo'?`
    - The Scope manager will say `Yes` and we get a reference to that `foo`
- Functions will be ignored unless they were invoked elsewhere
    - Same occurs again where we check the Scope of `baz()` for a variable called `foo` and same result again
- 3rd function
    - Since `foo` is a parameter of `baz()`, it will see `foo` as a variable in the `baz()` Scope
    - `bam` doesn’t exist in this Scope, so it will move out to the `global` Scope and see if it exists in the `global` Scope
    - We come to the `global` Scope, and the `global` Scope will say `Yes, I just created 'bam' for you` (in strict mode, it will say it doesn’t exist and throw an error)
    - _Note:_ This is how global leakage occurs in JavaScript, because `bam` is now a reference to a global variable or a variable declared somewhere outside of the Scope of `baz()`

# Hoisting

Hoisting is the conceptual model for how JavaScript works. Using the literal meaning of the word, hoisting is used to explain how Variables and Function declarations are **hoisted** to the top of a function or a global scope. They are hoisted to the top of our code and declared during the compile phase to make sure they are available for reference at runtime. Note that the function expression itself is not hoisted, but the declaration of that function is.

```javascript
var a = b();
var c = d();
a;
c;

function b() {
  return c
}

var d = function() {
  return b();
}
```

When compiled, the declarations are hoisted and effectively re-ordered like this:

```javascript
// Function declarations are moved to the top
function b() {
  return c;
}

// Variables are declared, but no value is assigned
var a;
var c;
var d;

// Declared variables are assigned values
a = b();
c = d();
a;
c;
d = function() {
  return b();
}
```

# Scope

Scope in JavaScript is where the compiler looks for variables and functions when it needs them. We know already that during the _Compile Phase_, JavaScript will looked at how variables are declared, but how about _Scope_?

### Lexical Scope

Above, we said that there are two phases that the JavaScript interpreter will go through - _Compile_ and _Execution_. During the _Execution Phase_ is when variable assignments are made and functions are executed. _Lexical Scope_ means **compile-time scope**, and so the _Lexical Scope_ is the scope that was determined after the _Compile Phase_. Let's put this together in an example:

**Initial code**
```javascript
'use strict'

var foo = 'foo'
var wow = 'wow'

function bar(wow) {
  var pow = 'pow'
  console.log(foo) // 'foo'
  console.log(wow) // 'zoom'
}

bar('zoom')
console.log(pow) // ReferenceError: pow is not defined
```

**After Compile Phase**
```javascript
'use strict'

// Variables are hoisted to the top of the current scope
var foo
var wow

// Function declarations are hoisted as-is at the top of the current scope
function bar(wow) {
  // wow = 'zoom'
  var pow
  pow = 'pow'
  console.log(foo) // 'foo'
  console.log(wow) // 'zoom'
}

foo = 'foo'
wow = 'wow'

bar('zoom')
console.log(pow) // ReferenceError: pow is not defined
```

- Declarations are hoisted to the top of their **current scope**
- `wow` is also declared within the scope of `bar()` as it's a function parameter

Now for the _Execution Phase_. If we look at `console.log(foo)`, the JS interpreter needs to find the declaration of `foo` before it executes this line. Is `foo` in the scope of `bar()`? No, move to its parent scope. Is `foo` in the `global` scope? Yes. The interpreter will now execute this line. When executing `console.log(pow)`, it can't find `pow` anywhere, which is why we see a `ReferenceError`.

### Function Scope

Variables declared in a _Function Scope_ cannot be accessed from outside the function. This is a very powerful pattern to create private properties and only have access to them from within a _Function Scope_.

### Block Scope

A `try/catch` statement will create a new _Block Scope_, and more specifically, only the `catch` clause will make this scope.

```javascript
'use strict'

try {
  var foo = 'foo'
  console.log(bar)
}
catch (err) {
  console.log(err)
}

console.log(foo)
console.log(err)
```

In this example, `foo` will work as expected, but `err` will throw a `ReferenceError`.

In ES6, `let` and `const` are also bound to the _Block Scope_ they were declared in. This can be any block, whether it's an `if`, `for` or `function` block. Before `let` and `const`, it would be extremely inconvenient to create "private" variables, but now we can enforce this quite easily. This does 2 things:
- Reduce the possibility of bugs, or difficult-to-understand bugs
- Allows the garbage collector to clean these variables once we're out of the _Block Scope_

**IIFE**

An IIFE (Immediately Invoked Function Expression) is a pattern that allows you to create a new _Block Scope_. They are function expressions that we invoke as soon as the interpreter runs through the function.

```javascript
var foo = 'foo';

(function bar() {
  console.log('in function bar');
})()

console.log(foo);
```

Above, the IIFE will be the first thing that we see logged. We just saw that function declarations are hoisted to the top by the interpreter, so how does this happen?
- Wrapping the function in `(function() { ... })` turns this into a function expression
- Adding `()` to the end will immediately invoke that function expression

```javascript
for (var i = 0; i < 5; i++) {
  (function logIndex(index) {
    setTimeout(function () {
      console.log('index: ' + index)
    }, 1000)
  })(i)
}
```

IIFEs are effective at creating private scopes. If we didn't use an IIFE above, the output would be `5, 5, 5, 5, 5`. By the time we've waited 1000ms, the value of `i` would be `5`, so each log would be `5`. With an IIFE, it will create a private scope with the correct value of `i` with each iteration of the `for` loop, and we get the desired output.

# Prototype

### What is prototype? And why is it difficult to understand?

For people that come to JavaScript from other languages, seeing `new`, `class` or `constructor` makes it clear to them how inheritance works as it's very similar to other languages. The problem with JavaScript is that these operators are just that, they are words which are there to help make you feel more comfortable. Under the hood, there is nothing familiar about how inheritance is happening. In JavaScript, Objects can be strange things.

**Class-based languages**
In class-based languages (Java, C++, C#, Python etc.), a `class` and an `instance` of that class are two distinctly different things. An instance will inherit all the properties and methods of the class, but generally cannot modify them or add others. By knowing where an instance comes from, you'll know exactly how it will behave.

**Prototype-based languages**
JavaScript doesn't have _real_ classes, so inheritance is possible due to the `prototype` Object. It does the following:

- An Object template from which we get the initial properties for a new Object
- Any Object can be used as a prototype
- The child Object can override the inherited methods/properties, which **will not** affect the prototype
- The prototype can change its attributes, or add new ones, which **will** affect the Object

So, the Object is just a _copy_ of the prototype Object and the prototype doesn't really care about this copy, but the Object definitely cares about the prototype.

**Prototype chain**

```javascript
const Vehicle = {
  used_for_transport: true,
}

const Car = {
  __proto__: Vehicle,
  wheels: 4,
  engine: 'diesel',
}

const Tesla = {
  __proto__: Car,
  engine: 'electric',
}
```

Using ES6, it's clear to see how the prototype chain is working. When we try to use our `Tesla` Object, it will have all of the properties of both `Car` and `Vehicle`, and it will also have overwritten the `engine` property inherited from `Car`. What is the prototype of `Vehicle` you might ask? Well, if it's not explicitly declared, the prototype will always be the global `Object()`.

Any time you try to access an Object's attribute, JavaScript is looking through the prototype chain to find the value. If it eventually gets to the global `Object()` and can't find the property, it will return `undefined`.

### Constructor function

We saw that for an Object, `__proto__` defines the Object's prototype. Another property, `prototype`, belongs only to functions. It's used to build the `__proto__` when the function is used as a constructor with the `new` operator.

```javascript
function Car(name) {
  this.name = name
}

const tesla = new Car('Tesla')
```

What's happening?
- An Object is created
- The `__proto__` of that Object is set to `Car.prototype`
- The function `Car` is called with `this` as the newly created Object

What does `tesla` look like?
- `name` will be `'Tesla'`
- `__proto__` will return:
    * `constructor` which is the function `Car`
    * `__proto__` which is the `prototype` of `Car` containing things such as `toString` etc.

The can create as many `Car` Objects as we want, and if we want to add a property to all of those `Car`s we can do so. `Car.prototype.wheels = 4` will set apply to all `Car` Objects. This is all done using the prototype chain. `Car` and `tesla` have no direct reference to each other.

### Classes

The JavaScript `class` appeals to developers from OOP backgrounds, but it's essentially doing the same thing.

```javascript
class Rectangle {
  constructor(height, width) {
    this.height = height
    this.width = width
  }

  get area() {
    return this.calcArea()
  }

  calcArea() {
    return this.height * this.width
  }
}

const square = new Rectangle(10, 10)

console.log(square.area) // 100
```

This is basically the same as:

```javascript
function Rectangle(height, width) {
  this.height = height
  this.width = width
}

Rectangle.prototype.calcArea = function calcArea() {
  return this.height * this.width
}
```

The `getter` and `setter` methods in classes bind an Object property to a function that will be called when that property is looked up. It's just syntactic sugar to help make it easier to _look up_ or _set_ properties.

# This

**Context**

We can’t alter how lexical scoping in JavaScript works, but we can control the _context_ in which we call our functions. Context is decided at runtime when the function is called, and it’s always bound to the object the function was called within. By saying, change the _context_, I mean, we’re changing what _this_ actually is.

Every function, **while executing**, has a reference to its current execution context, called `this`. (Execution context is when and how the function was called)

1. Implicit binding
2. Default binding
3. Explicit binding
4. New binding

To workout what `this` is, we check the **call-site** and see which of these 4 rules applies, with `new` taking the highest precedence.

**Implicit Binding**

Does the call-site have a context Object? Also referred to as an owning or containing Object. `this` will refer to the Object's properties

```javascript
var obj = {
  bar: 1,
  foo: function() {
    console.log(this.bar)
  }
}

obj.foo()
```

When `obj.foo()` is called, the call-site will be the `foo` function inside `obj`. Does the call site have a context Object? **Yes**, so `this.bar` will be `1`.

**Default Binding**

This is a plain function call, the most common scenario. More often than not it will refer to the `global` Scope or some other outer Scope.

```javascript
function foo() {
  console.log(this.a)
}

var a = 2

foo() // 2
```

**Explicit Binding**

This is where `.call()`, `.apply()` or `.bind()` is used at the call site to explicitly set the `this` reference.

e.g.
- `.call()` => `fn.call(thisObj, fnParam1, fnParam2)`
- `.apply()` => `fn.apply(thisObj, [fnParam1, fnParam2])`
- `.bind()` => `const newFn = fn.bind(thisObj, fnParam1, fnParam2)`

```javascript
var foo = function() {
  console.log(this.bar)
}

foo.call({ bar: 1 }) // 1
```

**New Binding**

Consider `var a = new Foo()`. This will do the following:

- Create a new empty Object called `a`
- Link the `a` Object to the `Foo` Object, which contains a `prototype` and `constructor`
- This new `a` Object gets bound as `this` in the `new Foo()` call

```javascript
function Foo(a) {
  this.a = a
}

var bar = new Foo(2)

console.log(bar.a) // 2
```

By calling `Foo(..)` with `new` in front of it, we've constructed a new Object and set that new Object as `this` for the call of `Foo(..)`.

**Nested functions**

The only exception to these rules are nested functions like this:

```JavaScript
const person = {
  personName: "MyPerson",
  personAge: 50,

  printInfo: function() {
    console.log('Name:', this.personName)
    console.log('Age:', this.personAge)

    nestedFunction = function() {
      console.log('this', this);
      console.log('Name:', this.personName)
      console.log('Age:', this.personAge)
    }

    nestedFunction()
  }
}

person.printInfo()
```

Using the logic above, let's look at `printInfo`. First, we need to go back to the call-site of `printInfo` and check what's happening. We can see that `person.printInfo()` is invoking the function, and `person` is an Object, so `printInfo()` is going to use `person` as `this` through implicit binding. Great!

To understand what's happening when `nestedFunction` is invoked, we need to recap the different ways of setting `this`.

```javascript
const obj = { value: 5 }

obj.fn(10)
fn.call(obj, 10)
fn.apply(obj, [10])

const newFn = fn.bind(obj)
newFn(10)
```

In all of the above examples, we are setting `this` as `obj`. Calling a function without a leading parent object will generally use the `global` object (`window` in browsers) as `this`. This means that when we call `nestedFunction()`, there is nothing to tell this function what `this` is, and it will use `global` as `this`.

An easy way to solve this is to make sure we call `nestedFunction` with the correct `this`. We can do this by changing the line to `nestedFunction.call(this)`, and this will work because when the function is invoked, `this` will be taken from `printInfo`, which in turn was invoked by `person` thus setting `this` as the `person` Object.

<details>
<summary>Click to test yourself!</summary>

Copy the code below into your browser or any other workspace and try to guess the correct outputs.

```javascript
const Factory = {
  value: 0,
  add: function(v) {
    this.value += v
  },
  subtract: (v) => this.value -= v
}

// What is Factory.value?
console.log('Expected: ')
console.log(`Actual: ${Factory.value}\n`)

Factory.add(1)
// What is Factory.value?
console.log('Expected: ')
console.log(`Actual: ${Factory.value}\n`)

Factory.subtract(1)
// What is Factory.value?
console.log('Expected: ')
console.log(`Actual: ${Factory.value}\n`)

const myAdd = Factory.add
myAdd(2)
// What is Factory.value?
console.log('Expected: ')
console.log(`Actual: ${Factory.value}\n`)
// Can you explain the result?

const myOtherAdd = {
  value: 10,
  add: Factory.add,
}

myOtherAdd.add(5)
// What is Factory.value?
console.log('\nExpected: ')
console.log(`Actual: ${Factory.value}`)
// What is myOtherAdd.value?
console.log('Expected: ')
console.log(`Actual: ${myOtherAdd.value}`)
```
</details>

## An alternate take on `this`

`2ality` proposed a different take on `this` now that we have arrow functions. In his take, he refers to `() => {}` as a **real** function and `function () {}` as an **ordinary** function.

**Ordinary Functions**

Here's an ordinary function:

```js
function add(x, y) {
  return x + y;
}
```

Every ordinary function has an implicit parameter `this`, that is always pre-defined as `undefined`. This makes these two lines pretty much the same:

```js
add(3, 5)
add.call(undefined, 3, 5)
```

If you nest ordinary functions, `this` from `outer` is shadowed.

```js
function outer() {
  function inner() {
    console.log(this) // undefined
  }

  console.log(this) // 'outer this'
}

outer.call('outer this')
```

Since `inner` is also an ordinary function, it has its own `this` and any `this` outside of it has been hidden away.

**Real Functions (arrow)**

Here's an arrow function:

```js
const add = (x, y) => {
  return x + y
}
```

If you nest an arrow function inside an ordinary function, `this` is not shadowed:

```js
function outer() {
  const inner = () => {
    console.log(this) // outer this
  }

  console.log(this) // outer this
  inner()
}

outer.call('outer this')
```

**The scope of an arrow function is determined by when it was created**. Above, it is created inside `outer`, thus it will inherit `this` from `outer`.

```js
function outer() {
  const inner = () => this
  console.log(inner.call('inner this')) // outer this
}

outer.call('outer this')
```

The `this` of an arrow function cannot be influenced. Above, our `inner` function is still behaving exactly the same as in the previous example, despite us trying to explicitly define its `this` using `inner.call()`. The arrow function was still created inside `outer`, and will still inherit `this` from `outer`.

**Ordinary Functions as Methods & the Dot Operator**

Ordinary functions are typically used to define "methods" on an Object:

```js
const obj = {
  prop: function () {}
  // Can also be written as:
  // prop() {}
}
```

We can access properties of an Object using the dot operator (`.`). The dot operator has 2 uses:

- Getting and setting properties using `obj.prop`
- Calling methods using `obj.prop(x, y)`

The latter is effectively the same as calling `obj.prop.call(obj, x, y)`. Again, when using an ordinary function `this`` is always explicitly defined. If we are just calling a regular function `fn(x, y)`, we can see there is no dot operator and thus we are basically calling `fn(undefined, x, y)` as `this`.

**Pitfalls of Using Ordinary Functions**

```js
callApi() {
  getUsers()
    .then(function () {
      this.logStatus('Done')
    })
}
```

In a callback like this, `this.logStatus` will fail because `this` is `undefined` as we saw in the `inner` & `outer` examples.

```js
callApi() {
  getUsers()
    .then(() => {
      this.logStatus('Done')
    })
}
```

As soon as we change it to an arrow function, it works. The arrow function is defined on-the-fly, which translates to it being defined inside `callApi` and having a reference to its `this`.

```js
prefixUserNames(names) {
  return names.map(function(name) {
    return `${this.company}: ${this.name}`
  })
}
```

Again, this will fail as `this.company` will be `undefined`. And again, with an arrow function it would be resolved.

**Pitfall: Using Methods as Callbacks**

Here's a component:

```js
class Component {
  constructor(name) {
    this.name = name

    const btn = document.getElementById('myButton')
    btn.addEventListener('click', this.handleClick)
  }

  handleClick() {
    console.log(`Clicked ${this.name}`)
  }
}
```

This component should log `this.name` when clicked, but what will actually happen is an error of `this` being undefined in the method. Why? Well, when we call `this.handleClick` we are effectively doing this:

```js
const handler = this.handleClick
handler()
```

As we know already this is calling `handler.call(undefined)` so of course it will fail. Here's the fix:

```js
btn.addEventListener('click', this.handleClick.bind(this))
```

Alternatively, we could define `handler` in the `constructor` as `this.handler = this.handleClick.bind(this)`, or write the `handleClick` method as an arrow function `handleClick = () {}`.

# Closure

Closure is when a function "remembers" its lexical scope (compile time scope), even when the function is executed outside that lexical scope. Here's a simple example:

```javascript
const a = 123

function foo() {
  console.log(this.a)
}
```

During the compile phase, this function will see that it needs to refer to a variable called `a`, and make a reference to the global `a` we created. Now, it doesn't matter where the call site of this function is, it will always refer to this global `a` variable.

Another example:

```javascript
function foo() {
  const bar = 'bar'

  function baz() {
    console.log(bar)
  }

  outerFn(baz)
}

function outerFn(baz) {
  baz()
}

foo()
```

At the end of this long winded function, `outerFn()` is invoking `baz()` from completely outside of `foo()`. If we tried to log `bar` from inside `outerFn`, we would not get `'bar'`.

`baz()` is passed into `outerFn()`, which "remembers" the lexical scope in which it was invoked. It "remembers" the lexical scope of `foo()`, which gives it a reference to `bar`.

**Private Variables**

Closures are also good for keeping some data private (creating Privileged Methods).

```javascript
const secretFunction = (secret) =>
    getSecret: () => secret
```

This `getSecret` function has access to its parent's Scope, giving it access to `secret` and any other variables created within `secretFunction`. If we try to access `secret` from outside of this `secretFunction`, it will throw an error.

# Map, Filter and Reduce

These three Array methods are various ways of looping through an Array and performing actions. These methods are far more readable than standard `for` loops as there are less pieces of code to read. Although not always faster than `for` loop, these functions personify Functional Programming as they don't mutate the original Array and have no side-effects.

### .map()

*Use when:* You want to map all the elements of an Array to another value.

*Example:* Convert Farenheit temperatures to Celsius

```javascript
const farenheight = [10, 55, 82, 43];

const celsius = farenheight.map(elem => Math.round((elem - 32) * 5 / 9);
```

*What it does:*

- Runs your function as a callback on every element of the Array from left to right
- Returns a **new** Array with the results

*Parameters:*

```javascript
arr.map((elem, index, arr) => {
  ...
}, thisArg);
```

| Parameter  | Meaning |
| ---------- | ------- |
| elem       | Element value
| index      | Index of the element, moving from left to right |
| arr        | The original Array used to invoke `.map()`
| thisArg    | Optional Object that will be referred to as `this` in the callback function

**NOTE:** `.map()` is exactly the same as `.forEach()`, except `.forEach()` will directly mutate the Array. A `.map()` function can also have other functions chained onto it, whereas a `.forEach()` cannot.

**NOTE:** Also, a `.forEach()` is generally used when you don't care about receiving a result from the looping and instead want to directly mutate the Array.

### .filter()

*Use when:* You want to remove unwanted elements from an Array.

*Example:* Remove numbers smaller than 10 from an Array.

```javascript
const numbers = [1, 2, 50, 3, 100, 9];

const bigNumbers = numbers.filter((elem, index, arr) => elem > 10);
```

*What it does:*

- Runs your function as a callback on every element of the Array from left to right
- The return value must be a `Boolean`, identifying if the element should be kept or removed
- Returns a **new** Array with the results

*Parameters:*

```javascript
arr.map((elem, index, arr) => {
  ...
}, thisArg);
```

| Parameter  | Meaning |
| ---------- | ------- |
| elem       | Element value
| index      | Index of the element, moving from left to right |
| arr      | The original Array used to invoke `.filter()`
| thisArg    | Optional Object that will be referred to as `this` in the callback function

### .reduce()

*Use when:* You want to iterate over an array accumulating a single result. Also used when you want to perform multiple actions on each item as it is more efficient than chaining multiple actions (e.g. `.filter(...).map(...)`).

*Example:* Get the sum of the elements in an Array

```javascript
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.reduce((acc, elem) => acc + elem, 0);
```

*Example 2:* First, get all the even numbers from an Array. Second, double these numbers. We could perform `.filter()` and then `.map()`, but it's more efficient to use `.reduce()`. In this is example, it is basically performing as a more readable and functional `for` loop.

```javascript
const numbers = [1, 2, 3, 4];

const result = numbers.filter((elem, index, arr) => {
  return elem % 2 === 0;
}).map((elem, index, arr) => {
  return elem * 2;
});
// 228.181ms in the browser for 1,000,000 items

const result = numbers.reduce((acc, elem) => {
  if (elem % 2 === 0) acc.push(elem * 2);

  return acc;
}, []);
// 59.956ms in the browser for 1,000,000 items
```

*What it does:*

- Runs your function as a callback on every element of the Array from left to right
- The value returned from the callback is passed on to the next callback, until finally it is returned from the `.reduce()`

*Parameters:*

```javascript
reduce((acc, elem, index, arr) => {
  ...
}, initialAcc);
```

| Parameter  | Meaning |
| ---------- | ------- |
| acc        | (Accumulator) Stores the cumulative value returned from each callback
| elem       | Element value
| index      | Index of the element, moving from left to right |
| arr      | The original Array used to invoke `.filter()`
| initialAcc | Used as the initial value of the accumulator in the first callback

# Call, Apply and Bind

This is me:

```javascript
const person = {
  firstName: 'Declan',
  lastName: 'Elcocks'
};
```

This is a function to say hello to me:

```javascript
function say(greeting) {
  console.log(`${greeting} ${this.firstName} ${this.lastName}`);
}
```

Now we need a way to tell our `say()` function that `this` should be the `person` Object we created previously. In comes `.call()`, `.apply()` and `.bind()`:

### .call()

`.call()` invokes the function, and allows you to pass in `arguments` one by one.

*Example:*

```javascript
say.call(person, 'Hello');
```

- `person` will be used as `this` in the function
- `'Hello'` will be used as the `greeting` parameter in the function. If the function accepts more than one parameter, it will also be separated by a comma.

### .apply()

`.apply()` invokes the function, and allows you to pass in an Array of `arguments`.

*Example:*

```javascript
say.apply(person, ['Hello']);
```

- `person` will be used as `this` in the function
- `'Hello'` will be used as the `greeting` parameter in the function. If the function accepts more than one parameter, it will go through the Array to assign the values of the parameters.

### .bind()

`.bind()` allows you to create a completely new function with the `this` of your choosing bound to it. Any arguments passed to `.bind()` will also be set as the values for those parameters.

*Example:*

```javascript
const sayHelloToDeclan = say.bind(person, 'Hello');
```

- Creates a new function `sayHelloToDeclan()` with the `person` Object bound to it as `this`
- `'Hello'` will be set as the value for the `greeting` parameter

*Example 2:*

```javascript
const multiply = (a, b) => a * b;

const multiplyByTwo = multiply.bind(this, 2);
```

- Creates a base function to multiply two numbers together
- Uses `.bind()` to create a **new** function with `num1` intialized as `2`
- **Note:** `this` still needs to be passed as the first argument when using `.bind()`. In this case, `this` will be set as the `global` Object as it is the Scope we are in.

### When to use each one?

- Use `.call()` to pass in comma separated arguments with `this`
- Use `.apply()` to pass in an Array of arguments with `this`
- `.bind()` is useful for currying functions and re-using functions as templates as with the `multiply()` example

*Note:* Currying is when you chain functions. With the `multiplyByTwo()` example, it is basically a function which calls another function straight away, thus chaining the two together.
