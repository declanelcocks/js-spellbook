- [Setup](#setup)
- [Snapshot Testing](#snapshot-testing)
- [Checking Props](#checking-props)
- [Event Handlers](#event-handlers)
- [Styling](#styling)

**Demo Component:**

Below is the demo component we're going to use throughout the examples on this page:

```
import Icon from './Icon'

const ButtonWithIcon = ({ handleClick, icon, text }) =>
  <button onClick={handleClick}>
    <Icon icon={icon} />
    {text}
  </button>

ButtonWithIcon.defaultProps = {
  icon: 'jest'
}

export default ButtonWithIcon
```

# Setup

Remember to do the following in your Jest setup files:

- If you want to use Snapshots, add `"snapshotSerializers": ["<rootDir>/node_modules/enzyme-to-json/serializer"]`
- Add the following to add your custom setup files to Jest: `"setupFiles": ["<rootDir>/private/jest/setup.js"]`
- If you use CSS modules in your components, add `"moduleNameMapper": { "^.+\\.(css|scss)$": "identity-obj-proxy" }`
- Add the following to handle importing files (e.g. images): `"moduleNameMapper": { ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/private/jest/fileMock.js" }` and inside `fileMock.js` you can just add `export default 'file'` to the file
- Add the below setup file to make your life easier when using `enzyme`:

```js
import { shallow, render, mount } from 'enzyme'
global.shallow = shallow
global.render = render
global.mount = mount
```

# Shallow Rendering

Diving straight in, `enzyme` allows us to use either `shallow` or `mount` when rendering a component. Here's an example:

```js
it('should...', () => {
  const iconName = 'jest'

  const wrapper = shallow(
    <ButtonWithIcon icon={iconName} />
  )

  // Tests here...
})
```

When using `shallow`, this would render the following:

```html
<button>
  <Icon icon="jest" />
  Hello Jest!
</button>
```

And with `mount`, it would render this:

```html
<button>
  <i class="icon icon_jest"></i>
  Hello Jest!
</button>
```

If we were just interesting in testing our `ButtonWithIcon` component, we'd most likely just need to use `shallow`. Below is a quick example of how we could use `shallow` for testing our component:

```js
it('renders label', () => {
  const component = shallow(<ButtonWithIcon label="foo" />)
  expect(component.find('button').text()).toEqual('foo')
})
```

# Snapshot Testing

Snapshot testing is great for creating a UI test, similar to how people would use Storybook to see what's rendered. Snapshot testing is more interested in checking the actual markup that gets rendered. In this case, a snapshot test would be great for our component as it's a very, very simple component. We can use this test to check if the icon is actually rendered inside the `<button>`.

Snapshots are saved as JSON, which means that Jest needs to be ran at least once in order to generate a snapshot. This means that these tests are not really ideal for TDD, but can be great for submitting to your PRs as it allows people to see quickly what's changed in the markup of each component.

```js
it('should render <Icon /> with the appropriate class', () => {
  const wrapper = shallow(
    <ButtonWithIcon icon={'jest'} />
  )

  expect(wrapper).toMatchSnapshot()
})
```

The example above could be quite good as it's a small component that we can easily check whether the test is passing or not. Of course, it does require some manual testing for it to be deemed a _successful_ test.

# Checking Props

One of the simplest tests to implement is to check that a certain `prop` has been passed into the component. This can be useful for cases such as our button to make sure the props are passed in, but it could be a lot more useful if you have a component which is going through a bunch of HOCs to manipulate its props.

```js
it('should apply the correct icon prop', () => {
  const iconName = 'jest'

  const wrapper = shallow(
    <ButtonWithIcon icon={iconName} />
  )

  expect(wrapper.prop('icon')).toEqual(iconName);
})
```

# Event Handlers

We can also add in some great tests for UI interactions such as event handlers (e.g. `onClick`). Starting with the most simple of tests, we can check that when our button is clicked, it calls its handler:

```js
it('should call handleClick when clicked', () => {
  const onClickHandler = jest.fn()

  const wrapper = shallow(
    <ButtonWithIcon handleClick={onClickHandler} />
  )

  expect(onClickHandler).not.toHaveBeenCalled()
  wrapper.simulate('click')
  expect(onClickHandler).toHaveBeenCalled()
})
```

We can also use snapshots for testing simple components that _render_ something as a result of an event handler or component method:

```js
it('should render a <Dropdown /> correctly when clicked', () => {
  const wrapper = shallow(
    <Dropdown />
  )

  // Check initial rendering of <Dropdown />
  expect(wrapper).toMatchSnapshot()

  wrapper.simulate('click')

  // Check rendering after clicking <Dropdown />
  expect(wrapper).toMatchSnapshot()
})
```

Again, this would require some manual checking for you to check that the markup rendered in the above test is correct. A key thing to remember here is that these Jest tests are great when you're testing small, isolated components. For example, it would be silly to try and create Jest tests for an entire page where there are so many things happening.

```js
it('should pass the correct value to the onChange handler', () => {
  const handleOnChange = jest.fn()
  const value = 'some value'

  const wrapper = shallow(
    <Select items={items} onChange={handleOnChange} />
  )

  // Check initial rendering of <Select />
  expect(wrapper).toMatchSnapshot()

  wrapper.find('select').simulate('change', {
    target: { value },
  })

  // Check correct value passed to onChange handler
  expect(handleOnChange).toBeCalledWith(value)
})
```

If you're using some third-party components, it could also be a good idea to check that the correct values are being returned back to your functions. It could also be good to make sure that you are passing data into your third-party library with the correct format.

### Behaviour Tests

We can also use stubs to create behaviour tests using the methods that we've just shown.

```js
const sandbox = sinon.createSandbox()

describe('Form', () => {
  afterAll(() => sandbox.restore())

  it('triggers form object onSuccess on submit', () => {
    const component = shallow(<Form />)
    const instance = component.instance()
    // Stub the native `onSuccess` function from `<form>`
    const stub = sandbox.stub(instance.form, 'onSuccess').returns(true)

    // Simulate the `submit` action from `<form>`
    component.find('form').simulate('submit')

    expect(stub.calledOnce).toBe(true)
  })
})
```

### Integration Tests

```js
it('displays comments after clicking a show comments button', () => {
  const article = mount(<Article comments={comments} />)

  article.find('ShowComments').simulate('click')

  expect(article.find('Comment').length).toBe(5)
})
```

We can use the above methods to create great integration tests such as the above. Whether or not these are worth writing is up to the team involved on the project, as some teams may prefer to use something like [storybook](https://github.com/storybooks/storybook) to deal with these kind of tests. The downside of using something like Storybook is that every component would have to be visually checked, whereas a lot of these simple tests could be automated with Jest.

# Styling

We can also pass in styles to our snapshot rather than actual HTML markup. For most components, this probably isn't necessary, but it could be useful for things such as layout components (e.g. grid, page, content or block components).

```js
it('should apply the correct styles', () => {
  const wrapper = shallow(
    <Grid
      gutter={10}
      columns={6}
    />
  )

  const style = wrapper.get(0).style

  expect(style).toMatchSnapshot()
})
```
