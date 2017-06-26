1. [Parent & Child Communication](#parent--child-communication)
2. [Avoiding Re-rendering Components](#avoiding-re-rendering-components)
3. [HOCs](#hocs)

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

# Avoiding Re-rendering Components

First, I'll point out that I'm using `PureComponent`, which performs a shallow equality check on the component's `props`. This means it will try to only re-render the component when the `props` have actually changed. Let's look at a couple of situations where doing something quite logical can negatively impact the performance of your component, and virtually ignore your `PureComponent`:

```javascript
class Table extends PureComponent {
  render() {
    return (
      <div>
        {this.props.items.map(i =>
          <Cell data={i} options={this.props.options || []} />
         )}
       </div>
     )
  }
}
```

We want to render some `items` if they exist and if not (`null`), render an empty Array. The problem here is that saying `|| []` is the same as saying `|| new Array()`. This means that every time we come into our component, we're going to create a completely new Array instance. Despite using `PureComponent`, it will see a **new** reference to a **new** Array and tell the component to re-render.

Fixing this is easy. Outside of our component we can create a constant `const defaultItems = []` and use it in our component `this.props.options || defaultItems`. Now, whenever we come into the `Table` class, we will always be using the same reference to `[]`.

Here's another example of unnecessary re-rendering:

```javascript
class App extends PureComponent {
  render() {
    return <MyInput onChange={e => this.props.update(e.target.value)} />
  }
}
```

OR

```javascript
class App extends PureComponent {
  update(e) {
    this.props.update(e.target.value)
  }

  render() {
    return <MyInput onChange={this.update.bind(this)} />
 }
}
```

Both of these implementations will have the same issue again where a new function is being created every time, and the component will be unexpectedly re-rendered despite none of the `props` changing. When using functions inside our component, we should try and bind the function as soon as possible.

```javascript
class App extends PureComponent {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this)
  }

  update(e) {
    this.props.update(e.target.value)
  }

  render() {
    return <MyInput onChange={this.update} />
  }
}
```

OR use

```javascript
update = (e) => {
  this.props.update(e.target.value)
}
```

This makes sure that as soon as the class is used, it binds the functions to the class. All instances of this class will then be using the same function, rather than creating their own instance of the function every time.

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

