## Call, Apply and Bind

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
----

`.call()` invokes the function, and allows you to pass in `arguments` one by one.

**Example:**

```javascript
say.call(person, 'Hello');
```

- `person` will be used as `this` in the function
- `'Hello'` will be used as the `greeting` parameter in the function. If the function accepts more than one parameter, it will also be separated by a comma.

### .apply()
----

`.apply()` invokes the function, and allows you to pass in an Array of `arguments`.

**Example:**

```javascript
say.apply(person, ['Hello']);
```

- `person` will be used as `this` in the function
- `'Hello'` will be used as the `greeting` parameter in the function. If the function accepts more than one parameter, it will go through the Array to assign the values of the parameters.

### .bind()
----

`.bind()` allows you to create a completely new function with the `this` of your choosing bound to it. Any arguments passed to `.bind()` will also be set as the values for those parameters.

**Example:**

```javascript
const sayHelloToDeclan = say.bind(person, 'Hello');
```

- Creates a new function `sayHelloToDeclan()` with the `person` Object bound to it as `this`
- `'Hello'` will be set as the value for the `greeting` parameter

**Example 2:**

```javascript
const multiply = (a, b) => a * b;

const multiplyByTwo = multiply.bind(this, 2);
```

- Creates a base function to multiply two numbers together
- Uses `.bind()` to create a **new** function with `num1` intialized as `2`
- **Note:** `this` still needs to be passed as the first argument when using `.bind()`. In this case, `this` will be set as the `global` Object as it is the Scope we are in.

### When to use each one?
----
- Use `.call()` to pass in comma separated arguments with `this`
- Use `.apply()` to pass in an Array of arguments with `this`
- `.bind()` is useful for currying functions and re-using functions as templates as with the `multiply()` example

*Note:* Currying is when you chain functions. With the `multiplyByTwo()` example, it is basically a function which calls another function straight away, thus chaining the two together.
