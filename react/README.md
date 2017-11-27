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
