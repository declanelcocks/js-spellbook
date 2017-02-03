## Destructuring

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
