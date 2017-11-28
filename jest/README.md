- [Setup](#setup)

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
