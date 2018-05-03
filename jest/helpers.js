/* global Response */
import url from 'url'

import { shallow } from 'enzyme'
import * as React from 'react'
import { oneLine } from 'common-tags'

export const randomId = () => {
  // Add 1 to make sure it's never zero.
  return Math.floor(Math.random() * 10000) + 1
}

export function assertHasClass(el, className) {
  expect(el.classList.contains(className)).toBeTruthy()
}

export function assertNotHasClass(el, className) {
  expect(el.classList.contains(className)).toBeFalsy()
}

/*
 * Repeatedly render a component tree using enzyme.shallow() until
 * finding and rendering TargetComponent.
 *
 * This is useful for testing a component wrapped in one or more
 * HOCs (higher order components).
 *
 * The `componentInstance` parameter is a React component instance.
 * Example: <MyComponent {...props} />
 *
 * The `TargetComponent` parameter is the React class (or function) that
 * you want to retrieve from the component tree.
 */
export function shallowUntilTarget(componentInstance, TargetComponent, {
  maxTries = 10,
  shallowOptions,
  _shallow = shallow,
} = {}) {
  if (!componentInstance) {
    throw new Error('componentInstance parameter is required')
  }
  if (!TargetComponent) {
    throw new Error('TargetComponent parameter is required')
  }

  let root = _shallow(componentInstance, shallowOptions)

  if (typeof root.type() === 'string') {
    // If type() is a string then it's a DOM Node.
    // If it were wrapped, it would be a React component.
    throw new Error(
      'Cannot unwrap this component because it is not wrapped')
  }

  for (let tries = 1 tries <= maxTries tries++) {
    if (root.is(TargetComponent)) {
      // Now that we found the target component, render it.
      return root.shallow(shallowOptions)
    }
    // Unwrap the next component in the hierarchy.
    root = root.dive()
  }

  throw new Error(oneLine`Could not find ${TargetComponent} in rendered
    instance: ${componentInstance} gave up after ${maxTries} tries`
  )
}

export function generateHeaders(
  headerData = { 'Content-Type': 'application/json' }
) {
  const response = new Response()
  Object.keys(headerData).forEach((key) => (
    response.headers.append(key, headerData[key])
  ))
  return response.headers
}

export function createApiResponse({
  ok = true, jsonData = {}, ...responseProps
} = {}) {
  const response = {
    ok,
    headers: generateHeaders(),
    json: () => Promise.resolve(jsonData),
    ...responseProps,
  }
  return Promise.resolve(response)
}

/*
 * A sinon matcher to check if the URL contains the declared params.
 *
 * Example:
 *
 * mockWindow.expects('fetch').withArgs(urlWithTheseParams({ page: 1 }))
 */
export const urlWithTheseParams = (params) => {
  return sinon.match((urlString) => {
    const { query } = url.parse(urlString, true)

    for (const param in params) {
      if (!query[param] || query[param] !== params[param].toString()) {
        return false
      }
    }

    return true
  }, `urlWithTheseParams(${JSON.stringify(params)})`)
}
