## Let and Const

In ES6, these are the new ways to declare variables. Hooray for not having to use `var` and have all of the closure issues that came with it.

### Immutable data with const

```javascript
function immutable() {
  const obj = { a: 1, b: 2 };
  const arr = [1, 2, 3, 4];

  obj.a = 'a';
  array.splice(1, 1);

  return { obj, arr };
}
```

An easy misunderstanding here could be to think that writing `obj.a = 'a'` will throw an error because it is a constant. It doesn't make the data immutable.

```javascript
function immutableReference() {
  const obj = { a: 'a' };
  obj = { a: 'q' };

  return obj;
}
```

It does mean that the **reference** is immutable. When using `const`, we are free to reassign the value of `obj.a`, but we cannot change what value `obj` is referencing.

### Block scoping

When using a regular `var` declaration, it is scoped to its closure. When using `let` and `const`, they are scoped to the block they are declared in, or the surrounding block.

```javascript
function ifBlock() {
  if (3 > 1) {
    const x = 34;
    let y = 43;
  }

  return { x, y };
}
```

So this will actually throw an error, because `x` and `y` are scoped to the `if` statement's block. If we had declared `x` and `y` using `var`, then our `return` statement would have had access the values through closure.

```javascript
function block() {
  {
    const x = 34;
    let y = 43;
  }

  return { x, y };
}
```

And in fact, the block can doesn't have to be an `if` statement. It can just be a simple block like this, and the same logic will still apply.

```javascript
function scoped() {
  let x = 10;

  {
    const x = 20;
  }

  return x;
}
```

And here, the value returned will be `10` since the `const` is only scoped to its block.

### Fixing the for loop

There's been a problem with `for` loops for a long time in JavaScript where the value of `i` can cause some issues. We declare the value of `i` using `var` normally, which can give us some unexpected results if we manipulating data inside the `for` loop.

```javascript
function forLoopExample() {
  const arr = [1, 2, 3, 4];
  const callbacks = [];

  for (var i = 0; i < arr.length; i++) {
    callbacks.push(function cb() {
      return arr[i];
    });
  }

  return callbacks.map(callback => callback());
}
```

We are looping through every item of the Array, and for each one we are pushing a callback function into a new Array called `callbacks`. The callback is nothing complicated, it just returns the value of `arr[i]`. At the end of the `function`, we loop through each callback and run it.

__Expected outcome__: We expect to loop through the `callbacks` Array, and see an Array created with the callbacks like this: `[1, 2, 3, 4]`.

__Actual outcome:__ We actually get an Array returned of `[undefined, undefined, undefined, undefined]`. Not ideal.

**Why?**
Let's break it down:

- `var` is scoped to its closure which is the `function` it was declared in
- Every time `i` is incremented, it's incrementing the value of `i` on a closure level
- Each callback is referencing this `i`, and remember that it is not pushing `arr[1]` to the callback, it is pushing `arr[i]` with a reference to `i`
- When each callback runs, it looks up the value of `i` and finds the `i` scoped to the closure
- When the `for` loop has finished, `i` is `4` and each callback is going to look for `arr[4]` which returns `undefined`

**How do we fix this?**
It's as simple as replacing `var i = 0` with `let i = 0`, and that's it. It works as expected.

- Each callback is now referencing an `i` variable from its block rather than the closure thanks to `let`.
- When each callback looks for `arr[i]`, it will referencing an `i` variable which is only available to that callback.
