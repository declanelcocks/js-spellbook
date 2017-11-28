- [Debounce](#debounce)

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
