## Template Literals

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

**Making HTTP requests:**

```javascript
POST`http://foo.org/bar?a=${a}&b=${b}
     Content-Type: application/json
     X-Credentials: ${credentials}
     { "foo": ${foo},
       "bar": ${bar}}`(myOnReadyStateChangeHandler);
```

Construct a readable HTTP request prefix used to interpret the replacements and construction

**styled-components:**

The [styled-components](https://github.com/styled-components/styled-components) library allows you to create React components like this:

```javascript
import styled from 'styled-components';

const StyledButton = styled.button`
  color: red;
`;

export default StyledButton;
```

Behind the scenes, this is taking advantage of template literals to create a readable syntax which makes writing CSS in JavaScript seem natural. It will call `styled.button()` with the String, and return a React component which uses the String for the component's styling.
