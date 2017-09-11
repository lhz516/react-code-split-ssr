import * as React from 'react'
import { matchPath, Redirect, Route, Switch } from 'react-router-dom'
import Bundle from './bundle'

export interface IJSXModule {
  default: React.SFC | React.ComponentClass
}

export interface ISSRRoute {
  path: string
  component: () => React.SFCElement<{ mod: Promise<IJSXModule> }>
  exact?: boolean
  strict?: boolean
}

export interface IRedirects {
  from: string
  to: string | object
  push?: boolean
}

export interface IOptions {
  pathname: string
  routes: ISSRRoute[],
  redirects?: IRedirects[],
  notFoundComp?: () => React.SFCElement<{ mod: Promise<IJSXModule> }>
}

const generateRoutes = async (
  options: IOptions = {
    pathname: '/',
    routes: [],
    redirects: [],
  },
): Promise<React.SFC> => {
  if (!Array.isArray(options.routes) || options.routes.length === 0) {
    throw new Error('options.routes must be an non-empty array')
  }

  if (!Array.isArray(options.redirects)) {
    throw new Error('options.redirects must be an array')
  }

  const preload = options.routes.find((route) =>
    !!matchPath(options.pathname, {
      path: route.path,
      exact: route.exact || false,
      strict: route.strict || false,
    }),
  )

  const preloadedComp: IJSXModule = preload === undefined
    ? await options.notFoundComp().props.mod
    : await preload.component().props.mod

  const renderComp = (path: string, bundle: React.SFC) => {
    if (!preloadedComp) return bundle
    const isSSR = (preload && preload.path === path) || (!preload && !path)
    return isSSR ? preloadedComp.default : bundle
  }

  return () => {
    return (
      <Switch>
        {options.routes.map((props, i) => (
          <Route key={i} {...props} component={renderComp(props.path, props.component)} />
        ))}
        {options.redirects.map((props, i) => (
          <Redirect key={i} {...props} />
        ))}
        <Route component={renderComp(null, options.notFoundComp)} />
      </Switch>
    )
  }
}

export default generateRoutes
