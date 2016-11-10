### .map()
----

**Use when:** You want to map all the elements of an Array to another value.

**Example:** Convert Farenheit temperatures to Celsius

```javascript
const farenheight = [10, 55, 82, 43];

const celsius = farenheight.map(elem => Math.round((elem - 32) * 5 / 9);
```

**What it does:**

- Runs your function as a callback on every element of the Array from left to right
- Returns a **new** Array with the results

**Parameters:**

```javascript
arr.map((elem, index, arr) => {
	...
}, thisArg);
```

| Parameter  | Meaning |
| ---------- | ------- |
| elem		   | Element value
| index      | Index of the element, moving from left to right |
| arr		   | The original Array used to invoke `.map()`
| thisArg    | Optional Object that will be referred to as `this` in the callback function

### .filter()
----

**Use when:** You want to remove unwanted elements from an Array.

**Example:** Remove numbers smaller than 10 from an Array.

```javascript
const numbers = [1, 2, 50, 3, 100, 9];

const bigNumbers = numbers.filter((elem, index, arr) => elem > 10);
```

**What it does:**

- Runs your function as a callback on every element of the Array from left to right
- The return value must be a `Boolean`, identifying if the element should be kept or removed
- Returns a **new** Array with the results

**Parameters:**

```javascript
arr.map((elem, index, arr) => {
	...
}, thisArg);
```

| Parameter  | Meaning |
| ---------- | ------- |
| elem		   | Element value
| index      | Index of the element, moving from left to right |
| arr		   | The original Array used to invoke `.filter()`
| thisArg    | Optional Object that will be referred to as `this` in the callback function

### .reduce()
----

**Use when:** You want to iterate over an array accumulating a single result. Also used when you want to perform multiple actions on each item as it is more efficient than chaining multiple actions (e.g. `.filter(...).map(...)`).

**Example:** Get the sum of the elements in an Array

```javascript
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.reduce((acc, elem) => acc + elem, 0);
```

**Example 2:** First, get all the even numbers from an Array. Second, double these numbers. We could perform `.filter()` and then `.map()`, but it's more efficient to use `.reduce()`. In this is example, it is basically performing as a more readable and functional `for` loop.

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

**What it does:**

- Runs your function as a callback on every element of the Array from left to right
- The value returned from the callback is passed on to the next callback, until finally it is returned from the `.reduce()`

**Parameters:**

```javascript
reduce((acc, elem, index, arr) => {
	...
}, initialAcc);
```

| Parameter  | Meaning |
| ---------- | ------- |
| acc        | (Accumulator) Stores the cumulative value returned from each callback
| elem		   | Element value
| index      | Index of the element, moving from left to right |
| arr		   | The original Array used to invoke `.filter()`
| initialAcc | Used as the initial value of the accumulator in the first callback
