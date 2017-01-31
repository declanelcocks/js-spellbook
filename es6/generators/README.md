## Generators

Generators are "pausable" functions available within ES6. Together with a library like `Bluebird`, generators can make using `Promise`'s a lot simpler and a lot nicer to read.

### My First Generator!
----

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
----
When using a Promise library like `Bluebird`, we can take advantage of some of their features to make using Promises and generators really simple.

**Synchronous API Calls**

```javascript
Promise.coroutine(function* () {
  const tweets = yield $.get('tweets.json');
  const profile = yield $.get('profile.json');

  console.log(tweets, profile);
});
```

Consider the above generator. It will run our API call for `tweets.json`, then fetch `profile.json`, then log the results to the console. When you look at it, it looks a million times simpler than using multiple `.then()` calls.

**Asynchronous API Calls**

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

### Build your own generator libary
----

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

**Process the Promises from our generator**

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
