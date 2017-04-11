1. [Map, Filter and Reduce](#map-filter-and-reduce)
2. [Call, Apply and Bind](#call-apply-and-bind)
3. [Destructuring](#destructuring)
4. [Arrow Functions](#arrow-functions)
5. [Function Generators](#function-generators)

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
