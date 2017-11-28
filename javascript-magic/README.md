- [Debounce](#debounce)
- [Piping](#piping)

# Debounce

Debouncing functions is something that's easily achieved through libraries such as [lodash](http://lodash.com). It's often difficult to fully comprehend what's happening with these sort of useful libraries as the source code makes for tough reading. So, by making our own `debounce` function, we can better understand what's going on under the hood.

Here's how we want to use our finished function:

```js
window.addEventListener('keyup', debounce((e) => {
  console.log(e)
}, 1000))
```

Above, we pass in a function and a timeout value. The goal of `debounce` is that, in this example, you can keep spamming one of the keys on your keyboard, but the callback will only run when it **doesn't** receive an event for `1000ms`. Basically, the function will run once you finish with your keyboard. This can be great for things such as search bars where you don't want to keep spamming the API with HTTP requests until the user has actually finished typing.

Here's the final implementation:

```js
const debounce = (fn, time) => {
  let timeout;

  return function() {
    const functionCall = () => fn.apply(this, arguments);

    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  }
}
```

- Returning a `function`: A `function` must be returned rather than the easier-to-read arrow function. An arrow function would lose its context as it would take it from the call-site of the `debounce`. Here, we want to make sure its context is inside `debounce`. Internally, we need to define `timeout` and clear it once the callback function has been invoked. To do that, we need the returned function to have closure over the `timeout` variable.
- `fn.apply(this, arguments)`: Here, we're taking our callback function and setting its `this` context as `this` from within `debounce`. We're also taking all the arguments that were passed into the callback and passing them over to our new callback.
- `clearTimeout`: Each time `debounce` is called, we need to call `clearTimeout` to ensure we are resetting the `debounce` function. An important note here is that we **need** to define `timeout` before this line so that `clearTimeout(undefined)` is called on the first run. If we ran `clearTimeout()` with no arguments, it would clear **all** timeouts globally.
- Finally, we call `setTimeout` again!

There you have it, a simple `debounce` function. Let's look at our initial example where we used a `keyup` event listener to call the `debounce` function, and see what's happening. Every time you press a key, the event listener will call our `debounce` function which is going to:

1. Copy the callback
2. Clear the timeout
3. Set a new timeout and run the function after it

If we keep triggering the `keyup` event, our `debounce` function will just keep resetting the old timeout and setting a new one. Eventually, when you stop triggering the event, the `setTimeout` will finally get to run and then we'll get to see the result of our debounced function!

# Piping

**What is piping?**

Piping is used to send the output of one function to another function for further processing. It's a pattern that is used by many libraries in order to chain functions together. [lodash](http://lodash.com) uses piping for things such as chaining array manipulations, and [recompose](http://github.com/acdlite/recompose) uses piping to chain `prop` manipulations for React components.

**How do you pipe?**

Let's take lodash as an example. If we wanted to chain multiple array manipulations, we'd have to make sure that each function a) does something to array and then b) returns the new array back out of it.

```js
const myPipe = pipe(sort, getFirst, getName)
myPipe(users)
```

At the end, we also need to return a function so that we can use it as in the above example.

**Simple pipe**

We want to be able to handle `n` functions eventually, but for now we'll hardcode it so it accepts 2 functions so we can better see how it will work.

```js
const pipe = (fn1, fn2) => {
  return (arg) => {
    const result1 = fn1(arg)
    return fn2(result1)
  }
}
```

Our `pipe` function now takes in two functions and returns a new one that will run each one on our argument.

```js
const users = [
  { name: 'barney', age: 36 },
  { name: 'fred', age: 40 },
  { name: 'pebbles', age: 1 }
];

const sortUsers = (users) => users.slice().sort((a, b) => a.age - b.age)
const createSentences = (users) => users.map(u => `${u.name} is ${u.age}`)

const getSentences = pipe(sortUsers, createSentences)
getSentences(users) // ["pebbles is 1", "barney is 36", "fred is 40"]
```

And there we go, a basic `pipe`.

**Refactor the pipe function**

After a simple refactoring we can get our `pipe` down to this:

```js
const pipe = (fn1, fn2) => arg => fn2(fn1(arg))
```

**Accepting `n` functions**

By taking advantage of ES6 features, we can do this:

```js
const _pipe = (fn1, fn2) => arg => fn2(fn1(arg))

const pipe = (...fns) => {
  return fns.reduce((prevFn, nextFn) => {
    return _pipe(prevFn, nextFn)
  })
}
```

`fns` will now be an Array of all operations to carry out. When we iterate each function, we are basically creating a pipe between it and the next function using our previous function. The end result will be something like `op4(op3(op2(op1(arg))))` which will take in our `argument` and pass it along to each function.

**Refactoring our `n` pipe**

Another quick refactor will result in:

```js
const _pipe = (fn1, fn2) => arg => fn2(fn1(arg))
const pipe = (...ops) => ops.reduce(_pipe)
```

Now, we can do something like this:

```js
const users = [
  { name: 'barney', age: 36 },
  { name: 'fred', age: 40 },
  { name: 'pebbles', age: 1 }
];

const sortUsers = (users) => users.slice().sort((a, b) => a.age - b.age)
const createSentences = (users) => users.map(u => `${u.name} is ${u.age}`)
const getFirstSentence = (users) => users.slice(0, 1).pop()

const getYoungestSentence = pipe(sortUsers, createSentences, getFirstSentence)
console.log(getYoungestSentence(users)) // "pebbles is 1"

const youngestSentence = pipe(sortUsers, createSentences, getFirstSentence)(users)
console.log(youngestSentence) // "pebbles is 1"
```

Note how we can either create a new function (`getYoungestSentence()`) using `pipe(...)`, or we can get the result straight away by passing in `(users)` as the `arg` after our `pipe(...)`.
