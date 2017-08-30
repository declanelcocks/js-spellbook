1. [Var, Let, and Const](#var-let-and-const)
    * [Immutable data with const](#immutable-data-with-const)
    * [Block scoping](#block-scoping)
    * [Fixing the for loop](#fixing-the-for-loop)
2. [Template Literals](#template-literals)
    * [Interpolation](#interpolation)
    * [Multiline strings](#multiline-strings)
    * [Tags](#tags)
3. [Destructuring](#destructuring)
    * [Simple destructuring](#simple-destructuring)
    * [Nested destructuring](#nested-destructuring)
    * [Destructuring an Array](#destructuring-an-array)
    * [Destructuring specific items in an Array](#destructuring-specific-items-in-an-array)
    * [Nested destructuring with Arrays](#nested-destructuring-with-arrays)
    * [Destructuring a mix of Arrays and Objects](#destructuring-a-mix-of-arrays-and-objects)
    * [Setting default values](#setting-default-values)
4. [Arrow Functions](#arrow-functions)
    * [Lexical scoping](#lexical-scoping)
5. [Function Generators](#function-generators)
    * [My First Generator](#my-first-generator)
    * [Generators with Bluebird](#generators-with-bluebird)
    * [Build your own generator library](#build-your-own-generator-library)

# Var, Let, and Const

In ES6, these are the new ways to declare variables. Hooray for not having to use `var` and have all of the closure issues that came with it. Here's how it works from a Scope perspective:

- `var` will be attached to the function it’s inside
- `let` will be attached to the block it’s inside
- `let` is not hoisted so has to be placed at the top of a block to make it available throughout the block

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

*_Expected outcome_*: We expect to loop through the `callbacks` Array, and see an Array created with the callbacks like this: `[1, 2, 3, 4]`.

*_Actual outcome:_* We actually get an Array returned of `[undefined, undefined, undefined, undefined]`. Not ideal.

*_Why?_*

Let's break it down:

- `var` is scoped to its closure which is the `function` it was declared in
- Every time `i` is incremented, it's incrementing the value of `i` on a closure level
- Each callback is referencing this `i`, and remember that it is not pushing `arr[1]` to the callback, it is pushing `arr[i]` with a reference to `i`
- When each callback runs, it looks up the value of `i` and finds the `i` scoped to the closure
- When the `for` loop has finished, `i` is `4` and each callback is going to look for `arr[4]` which returns `undefined`

*_How do we fix this?_*

It's as simple as replacing `var i = 0` with `let i = 0`, and that's it. It works as expected.

- Each callback is now referencing an `i` variable from its block rather than the closure thanks to `let`.
- When each callback looks for `arr[i]`, it will referencing an `i` variable which is only available to that callback.

# Template Literals

Template Literals help us to make creating dynamic Strings more readable, and also give us a lot more JavaScript power with our Strings.

### Interpolation

```javascript
function interpolation() {
  const greeting = 'Hello';
  const name = 'Declan';

  return `${greeting}, ${name}`;
}
```

Instantly, this is a bit more readable than seeing a lot of ` + `'s and other garbage to create a dynamic String.

### Multiline Strings

```javascript
function multiline() {
  return (`
    this is on a new line
    this is also on a new line
  `);
}
```

We can also declare a multiline String using template literals too. If you've ever had to write a HTML String, or had to add new lines to your string then you'll love this. You no longer have to use `\n` or indent multiple Strings in an attempt to make it look readable.

### Tags

```javascript
function tag() {
  const greeting = 'Hey';
  const name = 'Declan';

  return tag`I want to say: "${greeting}, ${name}!"`;

  function tag(stringParts, ...interpolations) {
    // {
    //   0: [ 'I want to say: "', ', ', '!"'],
    //   1: 'Hey',
    //   2: 'Declan'
    // }

    return arguments;
  }
}
```

You can also use a `tag` to customize the String's construction using a function. In this simple example, it's not that useful but it can be useful.

*_Making HTTP requests:_*

```javascript
POST`http://foo.org/bar?a=${a}&b=${b}
     Content-Type: application/json
     X-Credentials: ${credentials}
     { "foo": ${foo},
       "bar": ${bar}}`(myOnReadyStateChangeHandler);
```

Construct a readable HTTP request prefix used to interpret the replacements and construction

*_styled-components:_*

The [styled-components](https://github.com/styled-components/styled-components) library allows you to create React components like this:

```javascript
import styled from 'styled-components';

const StyledButton = styled.button`
  color: red;
`;

export default StyledButton;
```

Behind the scenes, this is taking advantage of template literals to create a readable syntax which makes writing CSS in JavaScript seem natural. It will call `styled.button()` with the String, and return a React component which uses the String for the component's styling.

# Destructuring

In ES6, these are the new ways to declare variables. Hooray for not having to use `var` and have all of the closure issues that came with it.

### Simple destructuring

```javascript
function getAverage() {
  const obj = { a: 1, b: 2, c: 3 };
  // Not an Object, it's called a destructuring pattern. We give a pattern that we want to use to pull things out of obj
  const { a, b, c } = obj;
  return Math.floor((a + b + c) / 3.0);
}
```

This simple example shows how we can use destructuring to make our final `return` statement much cleaner and easier to understand. The `{}` we use when saying `const { a, b, c }` is not an Object, but is a **destructuring pattern**. The pattern we give here will be used to describe how to pull the values out of `obj`.

### Nested destructuring

```javascript
function getAverageTemp() {
  const weather = {
    location: 'Hong Kong',
    unit: 'Celsius',
    today: { max: 20, min: 18 },
    tomorrow: { max: 22, min: 19 },
  };

  const {
    unit,
    today: {
      max: maxToday,
      min: minToday,
    },
    tomorrow: {
      max: maxTomorrow,
      min: minTomorrow,
    },
  } = weather;

  return {
    max: (maxToday + maxTomorrow) / 2.0,
    min: (minToday + minTomorrow) / 2.0,
    unit: unit,
  };
}
```

We can even destructure nested Objects to suit our needs. In this example, we've destructured the weather Object to get the `unit`, and then we go into the `today` and `tomorrow` Objects and destructure those as well. This kind of thing would be especially useful if we receive an API response, and we only want to pluck out certain pieces of data or assign certain pieces of data to specific names.

### Destructuring an Array

```javascript
function getFirstTwo() {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [firstItem, secondItem] = arr;

  return { firstItem, secondItem };
}
```

Just as easy to destructure an Array!

### Destructuring specific items in an Array

```javascript
function getItems() {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [firstItem, secondItem, , , fifthItem] = arr;

  return { firstItem, secondItem, fifthItem };
}
```

You can also pluck out specific items of an Array using the above. Rather than typing `first, second, third, fourth, fifth` to pluck out the first 5 items, we can choose to do nothing with the third and fourth items.

### Nested destructuring with Arrays

```javascript
function getItems() {
  const arr = [
    [1, 2, 3],
    ['a', 'b', 'c'],
    ['one', 'two', 'three'],
  ];
  const [
    [, secondNumber],
    [, secondLetter],
    [, secondWord]
  ];


  return { secondNumber, secondLetter, secondWord };
}
```

Just as easy as with Objets!

### Destructuring a mix of Arrays and Objects

```javascript
function getEnemy() {
  const info = {
    title: 'Once Upon A Time',
    protagonist: {
      name: 'Emma Swan',
      enemies: [
        { name: 'Regina Mills', title: 'Evil queen' },
        { name: 'Cora Mills', title: 'Queen of something' },
        { name: 'Peter Pan', title: 'The boy who never grew up' },
        { name: 'Zelena', title: 'The wicked witch' },
      ],
    },
  };

  const {
    title,
    protagonist: {
      name: protagonistName,
      enemies: {
        3: {
          name: enemyName,
          title: enemyTitle,
        }
      },
    },
  } = info;

  return `${enemyName} ${enemyTitle} is an enemy of ${protagonistName} in ${title}`;
}
```

We can just apply the same principals and easily destructure something containing both Objects and Arrays. When we have a big Array like the `enemies` Array here, we can also use an Object syntax where we specify the index in the Array and it will fetch that index in the Array.

### Setting default values

```javascript
function defaultValues() {
  const bench = { type: 'Piano', adjustable: false };
  const {
    legs: legCount = 4,
  } = bench;

  return legCount;
}
```

By adding an `=`, it's really easy to set defaults for variables if they don't exist or aren't passed in. It's very common to see this kind of syntax in the arguments of a function, like this:

```javascript
function reducer({ state = {}, action }) {
  ...
}
```

In Redux, it might be common to see this when creating a Reducer. If there is no state passed into the function, or if the state is `null`/`undefined` then it will default to `{}` which is something that our function can handle. Easy!

# Arrow Functions

Arrow functions, introduced in ES6, are anonymous functions which make use of lexical scoping. This means that they will "inherit" the scope from which they are called in.

**Note:** They are **not** a replacement for `function()`.

*_Single line return function:_*

```javascript
// ES5
function(a) {
  return a * 2;
}

// ES6
(a) => a * 2;
```

*_Standard function_*

```javascript
// ES5
function(a, b) {
  ...
}

// ES6
(a, b) => {
  ...
}
```

### Lexical Scoping

Typically with ES5, we would use `.bind()` or a `self = this` line to get over the pain of the `this` Object. With the lexical scoping of arrow functions in ES6, it's far simpler:

```javascript
// ES5
function FooCtrl (FooService) {
  var self = this;
  // Note the use of `self = this` to allow us to call `self` inside the Service's method

  this.foo = 'Hello';

  FooService.doSomething(function(response) {
    self.foo = response;
  });
}

// ES6
function FooCtrl (FooService) {
  this.foo = 'Hello';

  FooService.doSomething((response) => this.foo = response);
}
```

*A lot simpler!*

**Note:** It's important to note that `this` is not bound to the arrow function, but rather the `this` value is fetched lexically from the scope it sits inside.

# Function Generators

Generators are "pausable" functions available within ES6. Together with a library like `Bluebird`, generators can make using `Promise`'s a lot simpler and a lot nicer to read.

### My First Generator

```javascript
const myFirstGenerator = function* () {
  const one = yield 1;
  const two = yield 2;
  const three = yield 3;

  return 'Finished!';
}

const gen = myFirstGenerator();
```

Here's our first generator, which you can see by the `function*` syntax. The `gen` variable we declared will not run `myFirstGenerator`, but instead will basically say this generator is ready to use.

```javascript
console.log( gen.next() );
// Returns { value: 1, done: false }
```

When we run `gen.next()` it will unpause the generator and carry on. Since this is the first time we have called `gen.next()` it will run `yield 1` and pause until we call `gen.next()` again. When `yield 1` is called, it will return to us the `value` that was yielded and whether or not the generator is `done`.

```javascript
console.log( gen.next() );
// Returns { value: 2, done: false }

console.log( gen.next() );
// Returns { value: 3, done: false }

console.log( gen.next() );
// Returns { value: 'Finished!', done: true }

console.log( gen.next() );
// ERROR
```
As we keep calling `gen.next()` it will keep going onto the next `yield` and pausing each time. Once there are no more `yield`'s left, it will proceed to run the rest of the generator, which in this case simply returns `'Finished!'`. If you call `gen.next()` again, it will throw an error as the generator is finished.


### Generators with Bluebird

When using a Promise library like `Bluebird`, we can take advantage of some of their features to make using Promises and generators really simple.

*_Synchronous API Calls_*

```javascript
Promise.coroutine(function* () {
  const tweets = yield $.get('tweets.json');
  const profile = yield $.get('profile.json');

  console.log(tweets, profile);
});
```

Consider the above generator. It will run our API call for `tweets.json`, then fetch `profile.json`, then log the results to the console. When you look at it, it looks a million times simpler than using multiple `.then()` calls.

*_Asynchronous API Calls_*

```javascript
Promise.coroutine(function* () {
  const data = yield {
    tweets: $.get('tweets.json');
    profile: $.get('profile.json');
  };

  console.log(data.tweets, data.profile);
});
```
`Bluebird` also allows you to make multiple API calls asynchronously. In this example, it will fetch `tweets.json` and `profile.json` at the same time, and wait until **both** API calls have finished before unpausing the generator. This kind of behaviour could be very useful if you need to initiate your page with various data from various API endpoints.

### Build your own generator library

Let's build our own generator library which will function in the same way as the `co` library. This section was taken from a great youtube [video](https://www.youtube.com/watch?v=ategZqxHkz4) about generators.

```javascript
run(function* () {
  const API_URL = 'http://jsonplaceholder.typicode.com/posts/1';

  const response = yield $.get(API_URL);
  const post = yield response.json();
  const title = yield post.title;

  return title;
})
.catch(err => console.error(err.stack))
.then(result => console.log('Result:', result));
```

This is what we want to be able to run. We want to be able to call `run(generator)` and it will proceed to run through all of the `yield` calls and finally return a value. Inside `.then()` we will have access to the result returned at the end of our generator.

The simple API call we make will fetch a sample blog post from `jsonplaceholder`. After fetching it, we want to convert it into a nice `JSON` Object, and then extract and return the post's `title` value.

*_Process the Promises from our generator_*

```javascript
function run(generator) {
  // Prepare the generator for action
  const iterator = generator();

  // Recursive function to iterate through the generator
  // Each time it "iterates", it will be calling the next `yield`
    function iterate(iteration) {
    // Check if this was the last possible iteration of our generator
    // If it was, `done` will be `true` and we can return the final
    // value that our generator returned
    if (iteration.done) return iteration.value;

    // If it wasn't the last `yield`, we extract out the Promise from the yield's response
    // and iterate once more using the value it returns
    const promise = iteration.value;
    return promise.then(x => iterate(iterator.next(x));
  }

  // The `iterate` function will keep calling itself until the generator is finished
  // Once all the yields have been called, `iterate` will return the final return value from the generator
  return iterate(iteration.next());
}
```
