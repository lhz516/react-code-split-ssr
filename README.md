# React Code Split SSR
React code splitting with server side rendering

## How it works

- Based on React Router 4
- Server side: Load all components synchronously, then render to string.
- Client side: Load the initial component before rendering, render the entire screen synchronously, then load the rest of routes asynchronously.

#### Note: This packages is only tested in Meteor project, but technically it can be used in any Nodejs projects.

## Usage
```
$ npm i react-code-split-ssr --save
```
Client/server shared:
```js
import { Bundle } from 'react-code-split-ssr'
import React from 'react'

const Home = () => <Bundle mod={import('/imports/modules/home')} />
const Posts = () => <Bundle mod={import('/imports/modules/posts')} />

export const routes = [
  { exact: true, path: '/', component: Home },
  { exact: true, path: '/posts', component: Posts },
]

export const redirects = [
  { from: '/test', to: '/posts' }
]
```
Client:
```js
import  React from 'react'
import { render } from 'react-dom'
import { matchPath } from 'react-router'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { generateRoutes } from 'react-code-split-ssr'
import { routes, redirects } from '/imports/routes'
// import some components...

/* In an async function */
const Routes = await generateRoutes({
  routes,
  redirects,
  notFoundComp: NotFound,
  pathname: window.location.pathname,
})
render(
  <BrowserRouter>
    <Layout>
      <Routes />
    </Layout>
  </BrowserRouter>,
  document.getElementById('app'),
)
```
Server:
```js
import { Route, StaticRouter, Switch } from 'react-router'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { generateRoutes } from 'react-code-split-ssr'
import { routes, redirects } from '/imports/routes'
// import some components...

/* In an async server router */
const Routes = await generateRoutes({
  routes,
  redirects,
  notFoundComp: NotFound,
  pathname: req.url
})

const ServerRoutes = ({url, context = {}}) => (
  <StaticRouter
    location={url.pathname}
    context={context}
  >
    <Layout>
      <Routes />
    </Layout>
  </StaticRouter>
)
const bodyHtmlString = renderToString(<ServerRoutes url={sink.request.url} />)
// Use bodyHtmlString to where you need
```

## API

### Bundle - React Component \<Bundle\>
#### Props
- mod {Promise<Component>} ***Required*** - A `Promise` object which can be resolved to React Component
- loading {Component} - A React Component

### generateRoutes - Func (object: Options)
A function that returns a `Promise` object which can be resolved to React Router routes wrapped in `<Switch>`

#### Options
- pathname {string} ***Required*** - Pathname for initial loading
- routes {objects}[] ***Required*** - An array of `<Route>` props object
  - `component` field only accepts `() => <Bundle/>`
  - `location`, `render` fields are currently not supported
- redirects  {objects}[] - An array of `<Redirect>` props object
- notFoundComp {Component} - A React component for 404 Not Found, only accepts `() => <Bundle/>`

## v1.0.0 TODO
- [ ] SSR correctly for redirected routes
- [X] Change `notFoundComp` to `() => <Bundle />`
- [ ] Add more argument validations
