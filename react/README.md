- [Parent & Child Communication](#parent--child-communication)
    * [Instance Methods](#instance-methods)
    * [Callback Functions](#callback-functions)
- [Component vs. PureComponent](#component-vs-purecomponent)
    * [Shallow Comparison](#shallow-comparison)
    * [Don't bind functions inside render](#dont-bind-functions-inside-render)
    * [Don't derive data in render](#dont-derive-data-in-render)
- [Portals](#portals)
- [HOCs](#hocs)
    * [Intro to HOCs](#intro-to-hocs)
    * [Recompose: Lifecycle Hooks](#recompose-lifecycle-hooks)
    * [Recompose: Apply state/methods](#recompose-apply-statemethods)
    * [Recompose: Dynamic Rendering](#recompose-dynamic-rendering)
    * [Recompose: Formatting existing props](#recompose-formatting-existing-props)
    * [Render Props](#render-props)
    * [Function as Child components](#function-as-child-components)
    * [Another simple use case for render Props](#another-simple-use-case-for-render-props)
- [Provider](#provider)
    * [Context](#context)
    * [Simple Provider](#simple-provider)
    * [HOC Provider](#hoc-provider)
    * [Using Recompose to Create a Provider](#using-recompose-to-create-a-provider)

# Why do we use a framework?

There are many reasons, but one is that interacting with the DOM is one the most expensive operations you can do in Javascript in terms of performance. We should use it only when we have to, and this is one of the key principles that SPA frameworks try to take care of for us. For example, React will calculate exactly which nodes in the DOM need to be re-rendered and only re-render those.

# Lifecycle Methods

![](/react/lifecycle-methods.jpg "React lifecycle methods")

# Parent & Child Communication

### Instance Methods

In any frontend framework, this topic always comes up and questions get asked about it all the time. In React there are several ways you can achieve communication between parent and child components, so here are just a few:

```javascript
class TheChild extends Component {
  childMethod() {
    return 'hello'
  }
}

class TheParent extends Component {
  render() {
    return <TheChild ref={(foo) => { this.foo = foo }} />
  }

  componentDidMount() {
    const x = this.foo.childMethod()
    // x is now 'hello' thanks to TheChild's `childMethod`
  }
}
```

When rendering the child, we attach a `ref` (reference) with a name of our choosing so we can refer to the child throughout our parent component.

### Callback Functions

We can also pass a function from the parent to the child as props. The child can use this function to communicate with its parent. The Parent could also render several children, which can all have the ability to update a value within the parent.

```javascript
const TheChild = ({ parentFunc }) => <div>{props.parentFunc()}</div>

class TheParent extends Component {
  constructor(props) {
    super(props)
    this.parentFunc = this.parentFunc.bind(this)
  }

  parentFunc() {
    return 'Hello from TheParent'
  }

  render() {
    return <TheChild parentFunc={this.parentFunc} />
  }
}
```

# Component vs. PureComponent

What is `PureComponent`? The only difference between it and `Component` is that `PureComponent` will also handle the `shouldComponentUpdate` method for us. `PureComponent` performs a _shallow comparison_ on both `props` and `state` to decide if the component should update or not. For a `Component`, it will re-render by default any time `props` or `state` changes.

### Shallow Comparison

When comparing `props` and `state`, it will check that primitives have the same values and that _references_ are the same for Arrays and Objects. This behaviour encourages _immutability_ when it comes to Arrays and Objects, and always return new references rather than mutating the existing value.

Let's say you have an Array being passed into a `PureComponent`, and you want to add a new item to the Array. If you just wrote `myArray.push(1)`, the `PureComponent` would see a reference to the same Array, and not update. However, if we used a function that returned an entirely new Array with the new item added to it, our `PureComponent` would indeed update.

### Don't bind functions inside render

```javascript
class Parent extends Component {
  likeComment(userID) {
    // ...
  }

  render() {
    return (
      // ...
      <Comment likeComment={() => this.likeComment(user.id)} />
      // ...
    )
  }
}
```

Consider this simple `Parent` which renders a `Comment`. If `Parent` re-renders because of a change to another prop or state value, the entire `Comment` component will also re-render. Every time `Parent` re-renders, it creates an entirely new function and passes it in as the `likeComment` prop. If we had a list of comments, you can see how this could negatively impact performance.

```javascript
class Parent extends Component {
  likeComment = (userID) => {
    // ...
  }

  render() {
    return (
      // ...
      <Comment likeComment={this.likeComment} userID={user.id} />
      // ...
    )
  }
}

class Comment extends PureComponent {
  // ...
  handleLike() {
    this.props.likeComment(this.props.userID)
  }
  // ...
}
```

The same logic also applies when doing something like this:

```javascript
<Comments comments={this.props.comments || []} />
```

What we are expecting is that if there are no comments passed into the component, it will send an empty Array to the component. What actually happens here is that a new Array with a new reference is going to be used every time the `render()` method is ran. Instead, we can create a constant outside of our component (e.g. `const defaultComments = []`) and reference that.

### Don't derive data in render

For the same reason as above, we also shouldn't create new Arrays or Objects directly inside the `render()` method.

```javascript
render() {
  const { posts } = this.props
  const topTen = posts.sort((a, b) => b.likes - a.likes).slice(0, 9)
  return //...
}
```

Here we're creating a new Array called `topTen` when the component renders. `topTen` will have a brand new reference each time the component re-renders, even if `posts` hasn’t changed. This will then re-render the component unnecessarily.

There are a couple of ways we could solve this. The first would be to only set `topTen` when we know the value of `posts` has changed:

```javascript```
componentWillMount() {
  this.setTopTenPosts(this.props.posts)
}
componentWillReceiveProps(nextProps) {
  if (this.props.posts !== nextProps.posts) {
    this.setTopTenPosts(nextProps)
  }
}
setTopTenPosts(posts) {
  this.setState({
    topTen: posts.sort((a, b) => b.likes - a.likes).slice(0, 9)
  })
}
```

Another approach is to use `recompose` to create a new `prop` called `topTen` which is derived from the `posts` prop:

```javascript
export default compose(
  withPropsOnChange(['posts'], ({ posts }) => {
    return {
      topTen: posts.sort((a, b) => b.likes - a.likes).slice(0, 9)
    }
  })
)(Component)
```

And finally, you could consider using `reselect` to create selectors which return the derived data from Redux.

# Portals

Portals were a added in React 16, and straight away libraries such as [react-modal](https://github.com/reactjs/react-modal) used Portals to improve their libraries. Portals allow us to create links between a component and an element. In the case of creating a modal, most people that have used a modal library will know how annoying styling, controlling state, sharing state and HTML markup can be. The idea for Portals is that you can create one `<div>` outside of your React `<div>` and simply create a Portal to that `<div>` from inside your app.

Let's take a look at an example:

```js
class ExternalPortal extends Component {
  constructor(props) {
    super(props);
    // STEP 1
    this.containerEl = document.createElement('div');
    this.externalWindow = null;
  }

  componentDidMount() {
    // STEP 3
    this.externalWindow = window.open('', '', 'width=600,height=400,left=200,top=200');

    // STEP 4
    this.externalWindow.document.body.appendChild(this.containerEl);

    // STEP 5
    this.externalWindow.addEventListener('beforeunload', () => {
      this.props.handleClosePortal();
    });
  }

  componentWillUnmount() {
    this.externalWindow.close();
  }

  render() {
    // STEP 2
    return ReactDOM.createPortal(this.props.children, this.containerEl);
  }
}
```

What's happening here?

1. Create an empty `<div>`
2. Create a Portal with `this.props.children` as its children, and render those inside our new empty `<div>`
3. Upon mounting, create a new external window
4. We now have a `<div>` with a Portal attached to it, which is rendering whatever children are passed into it. Here, we just append the body of our new external window with our `<div>` Portal
5. Lastly, we listen for whenever this external window is closed. When it's closed, we'll call `this.props.handleClosePortal` which should be passed in by its parent and trigger some side-effects in the parent

So, now we have a Portal that when used, will render whatever its children are and call a parent prop when closed. Most importantly, it's rendered somewhere completely outside of the `<div>` which holds our React app!

```js
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      counter: 0,
      showPortal: false,
    };
  }

  componentDidMount = () => {
    window.addEventListener('beforeunload', () => this.closePortal());

    window.setInterval(() => {
      this.setState(state => ({
        counter: state.counter + 1,
      }));
    }, 1000);
  }

  togglePortal = () => this.setState({ showPortal: !this.state.showPortal })

  closePortal = () => this.setState({ showPortal: false })

  render() {
    return (
      <div>
        <h1>Counter: {this.state.counter}</h1>

        <button onClick={this.togglePortal}>`${this.state.showPortal ? 'Close' : 'Open'} Portal`</button>

        {/* Use our Portal instance and pass in `this.state.counter` */}
        {this.state.showPortal && (
          <ExternalPortal handleClosePortal={this.closePortal} >
            <h1>`Counter in a Portal: ${this.state.counter}`</h1>

            <button onClick={() => this.closePortal()}>Close!</button>
          </ExternalPortal>
        )}
      </div>
    );
  }
}
```

Now we have a straight forward `App` component, which has some local state to store `showPortal`, `counter` and some methods to toggle/update those state properties. When `showPortal` is `true`, we render our `ExternalPortal` and pass in children which take advantage of `App`'s local state, and also pass in `App`'s method to close the Portal. Magic! ✨

# HOCs

A higher-order component (HOC) is a function that takes a component and returns a new component. Typically, HOCs are helpers or utilities which you apply to a component to give it some additional functionality. Redux's `connect()` is a good example of a HOC, which is invoked by calling `connect(...)(MyComponent)` and will help connect your component to Redux.

### Intro to HOCs
Here's a really simple example, where I have a `<User />` component which takes in a `name` and renders it. Below that, I have 2 more cases that I want to achieve. With `alwaysBob`, I want to be able to create a `<User />` where the `name` prop is always set to `"Bob"`. With `neverUpdate`, I want to be able to create a `<User />` which never re-renders, even when receiving new props.

```javascript
const User = ({ name }) => <div className="User">{ name }</div>
const User2 = alwaysBob(User)
const User3 = neverUpdate(User)

const App = () =>
  <div>
    <User name="Tim" />
    <User2 name="Joe" />
    <User3 name="Steve" />
  </div>
```

`alwaysBob` will take in a prop and simply return the `BaseComponent` with `{...overrideProps}` after `{...props}` to override the values.

```javascript
const overrideProps = (overrideProps) => (BaseComponent) => (props) =>
  <BaseComponent {...props} {...overrideProps} />

const alwaysBob = overrideProps({ name: 'Bob' })
```

`neverUpdate` will return a `class` implementation of the `BaseComponent` with `shouldComponentUpdate` set to false to force it never to update

```javascript
const neverUpdate = (BaseComponent) =>
  class extends Component {
    shouldComponentUpdate() {
      return false
    }

    render() {
      return <BaseComponent {...this.props} />
    }
  }
```

Easy!

### Recompose: Lifecycle Hooks

We can replace the `neverUpdate` HOC above with a much simpler implementation thanks to `recompose`.

```javascript
import { lifecycle } from 'recompose'

const neverUpdate = compose(
  lifecycle({
    shouldComponentUpdate() {
      return false
    }
  })
)

const UserWithNeverUpdate = neverUpdate(User)
```

### Recompose: Apply state/methods

In this example, I'm going to add a state and some methods to the component. Normally, you'd have to go back and change the component to a Class component, then add some methods, then take care of binding the methods, then keep track of updating the state etc. Long story short, your component will look less and less like a simple UI component. Recompose, can help to add class-like methods to our functional components.

Take this Card:

```javascript
const Card = ({ opened, handleClick, title, picture, description }) => {
  return (
    <div className={ opened ? 'card open' : 'card closed' }>
      <div className="header" onClick={handleClick}>
        {title}
      </div>

      <div className="body">
        <img src={picture} />
        <p>{description}</p>
      </div>
    </div>
  )
}
```

It applies a dynamic class to the `<div>` container depending on if `this.props.opened` is `true` or `false`. How is it updated? The Card's header has an `onClick` event attached to it which will call `this.props.handleClick`. Enter `recompose` again:

```javascript
const enhance = compose(
  withState('opened', 'setOpened', true),

  withHandlers({
    handleClick: props => event => {
      // setOpened is applied in withState()
      props.setOpened(!props.opened)
    },
  })
)

export default enhance(Card)
```

`withState` is called with `stateName, stateUpdaterName, initialState` and will essentially pass the first two as `props` to the component and the third as `defaultProps`. `withHandlers` is just a nice way of adding a method to your component's `props` just like you would with a class method. There are a couple of benefits from doing this with `recompose` however. Recompose will take care of making sure a new handler is not created with every render. If you were to define your handler just before your `return(...)`, it would create a new instance of that function on every render, which in a large application could become very costly. It could also be ignored by optimzations such as `shouldComponentUpdate()` which tries to prevent re-rendering from happening.

### Recompose: Dynamic Rendering

Let's say we have a list:

```javascript
const App = ({ zombies }) => {
  return (
    <div>
      {
        zombies.map(zombie => (
          <Card
            key={zombie.title}
            title={zombie.title}
            picture={zombie.picture}
            description={zombie.description}
          />
        ))
      }
    </div>
  )
}
```

I want to render a `<Spinner />` if the data is still being loaded, and now that I think about it I also want to fetch the data when the App is mounted.

```javascript
const enhance = compose(
  lifecycle({
    componentDidMount() {
      this.props.fetchZombies()
    }
  }),

  branch(
    ({ zombies, ...others }) => zombies.length === 0,
    renderComponent(Spinner)
  )
)

export default enhance(App)
```

As easy as that. `branch()` allows us to make sure our functional component remains a really simple UI component, and moves the dynamic rendering logic into a separate function. As we saw before, we can also use `lifecycle()` to access the lifecycle methods of a component without having to turn it into a class component.

### Recompose: Formatting existing props

Let's say you have a very simple `<Date />` component which simply renders a UI for a given date.


```javascript
const Date = ({ date }) => <h1>`My DOB is ${date}`</h1>
```

As simple as you can get, it takes in a `date` and renders it. But what happens if we decide we want to format the `date`? We can pass in the `date` in the necessary format to `<Date />`, or we can simple format the `date` locally. This is the better approach as we may not want to change `date`'s data structure; we just want to change how the UI renders the data.

```javascript
const getFormattedDate = d => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`

export default compose(
  withPropsOnChange(['dob'], ({ dob }) => {
    return { dob: getFormattedDate(dob) }
  })
)(Date)
```

Now, Recompose will take care of creating this formatted prop whenever the `dob` prop changes.

### Render Props

**Background:**

Diving straight in, here's a HOC which gives a component `props.mouse` with `x` and `y` co-ordinates.

```js
const withMouse = (Component) => {
  return class extends React.Component {
    state = { x: 0, y: 0 }

    handleMouseMove = (event) => {
      this.setState({
        x: event.clientX,
        y: event.clientY
      })
    }

    render() {
      return (
        <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>
          <Component {...this.props} mouse={this.state}/>
        </div>
      )
    }
  }
}

const App = React.createClass({
  render() {
    // Instead of maintaining our own state,
    // we get the mouse position as a prop!
    const { x, y } = this.props.mouse

    return (
      <div style={{ height: '100%' }}>
        <h1>The mouse position is ({x}, {y})</h1>
      </div>
    )
  }
})

// Just wrap your component in withMouse and
// it'll get the mouse prop!
const AppWithMouse = withMouse(App)

ReactDOM.render(<AppWithMouse/>, document.getElementById('app'))
```

Now we can wrap any component and it'll receive `this.props.mouse`. So what's wrong with it?

- **Indirection:** With multiple HOCs being used together, we can very easily be left wondering where our state comes from and wondering which HOC provides which props.
- **Naming collisions:** Two HOCs that try to use the same prop name will collide and overwrite one another, and it's actually quite annoying because React won’t warn us about the prop name collision either.
- **Static composition:** HOCs have to be used outside of React's lifecycle methods, as we see with `AppWithMouse` above, which means we can't do much in the way of making our HOCs dynamic.
- **Boilerplate:** There's a lot of boilerplate that comes with a HOC, and as you can see in the above example, we had to make sure our `withMouse` HOC included `height: 100%` as part of its style. HOCs are wrapping your components with additional components, so inevitably you're going to end up in some messy styling situations at some point. The component that is returned from the HOC needs to act as similarly as it can to the component that it wraps.

**Seeing the light of render props**

> A render prop is a function prop that a component uses to know what to render

So what does this mean? Well, the idea is this: instead of “mixing in” or decorating a component to share behaviour, just render a regular component with a `render` prop that it can use to share some state with you. Here's our `withMouse` HOC as a render prop:

```js
class Mouse extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired
  }

  state = { x: 0, y: 0 }

  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    })
  }

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    )
  }
}

const App = () => (
  <div style={{ height: '100%' }}>
    <Mouse render={({ x, y }) => (
      <h1>The mouse position is ({x}, {y})</h1>
    )}/>
  </div>
)
```

Now hold on, our `Mouse` component is just calling `this.props.render(this.state)`? `Mouse` is now a component that just exposes its internal state to a `render` prop. This means that `App` can render whatever it wants with that state. Does this solve any of the issues we had with HOCs?

- **Indirection:** Yes. We no longer wonder where our state is coming from as we can see them in the render prop's arguments, and we can see it comes from `<Mouse />`
- **Naming collisions:** Yes. We are not merging any property names together anymore, and neither is React.
- **Boilerplate:** Yes. In most cases, there would be little to no boilerplate needed as we are no longer wrapping components with more components. We are just passing some data into a render function. In some cases you could even just do `return this.props.render(this.state)` and be done with it.
- **Static composition:** Yes. Everything is happening inside the `render` method, so we get to take advantage of the React lifecycle.

### Function as Child components

We've already looked at `render` props, so now let's look at the similar concept of functions as child components. Here's a simple example:

```js
const MyComponent = ({ children }) => <div>{children('Declan')}</div>

// Usage
<MyComponent>
  {(name) => <div>{name}</div>}
</MyComponent>

<MyComponent>
  {(name) => <img src="/my-picture.jpg" alt={name} />}
</MyComponent>
```

As you can see, it's really easy to re-use these components as `MyComponent` is just exposing some data to whatever its `children` function renders.

**A more complicated example**

Next, we'll create a `<Ratio>` component that listens for resize events and gives the device dimensions to its child.

**The boilerplate:**

```js
class Ratio extends Component {
  render() {
    return (
      {this.props.children()}
    )
  }
}

Ratio.propTypes = {
  children: React.PropTypes.func.isRequired,
}
```

Now we have a simple component, and we explicitly tell the user of it that we're expecting a function as `props.children`. Now let's add some internal state to `Ratio`:

```js
class Ratio extends React.Component {
  constructor() {
    super(...arguments)

    this.state = {
      hasComputed: false,
      width: 0,
      height: 0,
    }
  }

  getComputedDimensions({ x, y }) {
    const { width } = this.container.getBoundingClientRect()

    return {
      width,
      height: width * (y / x),
    }
  }

  componentWillReceiveProps(next) {
    this.setState(this.getComputedDimensions(next))
  }

  componentDidMount() {
    this.setState({
      ...this.getComputedDimensions(this.props),
      hasComputed: true,
    })

    window.addEventListener('resize', this.handleResize, false)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false)
  }

  handleResize= () => {
    this.setState({
      hasComputed: false,
    }, () => {
      this.setState({
        hasComputed: true,
        ...this.getComputedDimensions(this.props),
      })
    })
  }

  render() {
    return (
      <div ref={(ref) => this.container = ref}>
        {this.props.children(this.state.width, this.state.height, this.state.hasComputed)}
      </div>
    );
  }
}

Ratio.propTypes = {
  x: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired,
  children: React.PropTypes.func.isRequired,
}

Ratio.defaultProps = {
  x: 3,
  y: 4
};
```

We did a lot here. We basically have an `eventListener` listening for `resize` events, and whenever it receives an event it just calculates the ratio based on the device width. After, we pass all that into our `children` function. Now, we can use it however we want:

```js
<Ratio>
  {(width, height, hasComputed) => (
    hasComputed
      ? <img src="/my-image.png" width={width} height={height} />
      : null
  )}
</Ratio>

<Ratio>
  {(width, height, hasComputed) => (
    <div style={{ width, height }}>Hello world!</div>
  )}
</Ratio>

<Ratio>
  {(width, height, hasComputed) => (
    hasComputed && height > TOO_TALL
      ? <TallThing />
      : <NotSoTallThing />
  )}
</Ratio>
```

**Positives:**
- The user can choose what they do with the properties passed into `children`
- The user can choose what property names to use as it's just a function. A lot of HOCs will force you to use their property names
- No naming collisions as there isn't any binding connection between the HOC and its child. Instead you could use 2 HOCs together that both calculate the device width and have no issues at all
- HOCs remove constants! See below for an example:

```js
MyComponent.MyConstant = 'HELLO'

export default connect(..., MyComponent)
```

Normally, a HOC would remove your `MyConstant` unless your HOC manually re-implements it.

### Another simple use case for render Props

This time, I'm going to have a simple `<List />` component which takes in a URL and renders a list. Why is this useful? Well, let's see:

```js
class List extends React.Component {
  state = {
    list: [],
    isLoading: false,
  }

  fetchData = async () => {
    const res = await fetch(this.props.url)
    const json = await res.json()

    this.setState({
      list: json,
      isLoading: false,
    })
  }

  componentDidMount() {
    this.setState({ isLoading: true }, this.fetchData);
  }

  render() {
    return this.props.render(this.state);
  }
}
```

Now we have a component which takes care of fetching the data and applying any internal states such as `loading`. It's important to minimize duplicated code in a project to promote consistency and simplicity within the codebase (and UI). It also reduces the number of points of origin for an error when debugging, which is always good.

Here's how we would use that `<List />` component:

```js
<List
  url="https://api.github.com/users/declanelcocks/repos"
  render={({ list, isLoading }) => (
    <div>
      <h2>My repos</h2>
      {isLoading && <h2>Loading...</h2>}

      <ul>
        {list.length > 0 && list.map(repo => (
          <li key={repo.id}>
            {repo.full_name}
          </li>
        ))}
      </ul>
    </div>
  )} />
```

If we know that every component will have a consistent `Loading...` message, we could also extend our `List` to take care of this too.

# Provider

Use React, and you're almost guaranteed to run into some form of `<Provider>` component. Redux, MobX or any theming library all use this pattern in order to pass down props to every component.

### Context

First, we need to understand what React's Context is, as that's what all of these Providers are using. React often encourages people not to use context, but it's a powerful feature which can be great for making all components aware of things such as state or themes. You can also use context on a much smaller scale than the entire app. Consider the following:

```
--A--B
   \
    C--D--E
```

Imagine that component B and E both relied on a variable or method used in component A. With no state management library such as Redux, we'd have to pass that variable down through all of the components until we got to E. With context we could just provide this variable in context, and then consume context in the components that need it. It's often said **not** to do this as you can very easily make a lot of components aware of things they don't need to be.

A much better example would be if you have a global theme, as _every_ component would need to be aware of this theme in order to perform its own styling.

**How?**

```js
class A extends Component {
  getChildContext() {
    return {
      theme: "green"
    };
  }

  render() {
    return <D />;
  }
}

class E extends Component {
  render() {
    return (
      <div style={{ color: this.context.theme }}>
        {this.children}
      </div>
    );
  }
}
```

Here's a full example of what we mentioned above to show how context is used.

### Simple Provider

Now that we know how context works, let's use it to provide our app with a theme.

```js
class ThemeProvider extends Component {
  getChildContext() {
    return { color: this.props.color }
  }

  render() {
    return <div>{this.props.children}</div>
  }
}

ThemeProvider.childContextTypes = {
  color: PropTypes.string
}

// Our main file somewhere
ReactDOM.render(
  <ThemeProvider color="green">
    <App />
  </ThemeProvider>,
  document.getElementById('app')
)

class Paragraph extends React.Component {
  render() {
    const { color } = this.context

    return <p style={{ color: color }}>{this.props.children}</p>
  }
}

Paragraph.contextTypes = {
  color: PropTypes.string
}
```

Now we have a `ThemeProvider` that takes in a single prop, and sets that prop as context throughout the whole app. If you've used any state management libraries this should all be looking very familiar. In any child component of `<App />` we can now access `this.context.color` just as you would with any `this.props` or `this.state`. You may now know what's next, how do we turn this into a more friendly HOC than using `this.context` everywhere?

### HOC Provider

```js
const getContext = contextTypes => Component => {
  class GetContext extends React.Component {
    render() {
      return <Component { ...this.props } { ...this.context } />
    }
  }

  GetContext.contextTypes = contextTypes

  return GetContext
}
```

This will work exactly the same as any other library. The main purpose of this is to try and reduce the amount of properties being sent into our child component. If, for example, we have 100s of properties stored in context, then we don't want to send all of them down to every component.

```js
const Heading = ({ color, children }) => <h1 style={{ color }}>{children}</h1>

const contextTypes = {
  color: PropTypes.string
}

const HeadingWithContext = getContext(contextTypes)(Heading);
```

Just as we do with Redux's `connect` function, we can create an Object defining what we want from context, and our `getContext` helper will fetch it and add it as `props` to the component. Great!

### Using Recompose to Create a Provider

`recompose` can be used to create the above context HOC in a much cleaner fashion:

```js
const Provider = () => withContext(
  { store: PropTypes.object },
  props => ({ store: props })
)(props => React.Children.only(props.children));

const connect = Component => getContext(
  { store: PropTypes.object }
)(Component);

export { Provider, connect };
```

Much simpler. Our Provider will work exactly the same, but our `getContext` helper can be refactored into a much cleaner `connect` helper. It uses `getContext` to deconstruct the `context` Object and get `context.store`, and then pass that in as `props` for the component.

**How to use it?**

```js
const App = () => <Home />

const Home = connect(({ store }) => <h1>{store.app.title}</h1>)

render(
  <Provider app={{ title: 'recompose is cool' }}>
    <App />
  </Provider>,
  document.getElementById('app')
)
```

Just like that, we have virtually implemented `react-redux`. In fact, if we really did want to implement `react-redux` we'd only have to change our `connect` helper to the following for it to work:

```js
const connect = mapStateToProps => Component => compose(
  getContext({ store: PropTypes.object }),
  mapProps(props => ({ ...props, ...mapStateToProps(props.store) })),
)(Component);

// Usage
const mapStateToProps = store => ({
  title: store.app.title
})

export default connect(mapStateToProps)(Home)
```

Now, our `connect` helper will first get the context, and then use our `mapStateToProps` function to map the required props to the component. It's not perfect, as it currently requires a `mapStateToProps` function to be passed in, but the basic idea is there at least.
