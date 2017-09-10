import * as React from 'react'
import { matchPath, Route, Switch } from 'react-router-dom'

export interface IJSXModule {
  default: React.SFC | React.ComponentClass
}

export interface ISSRRoute {
  path: string
  component: () => React.SFCElement<{ mod: Promise<any> }>
  exact?: boolean
  strict?: boolean
}

export interface IOptions {
  pathname: string
  routes: ISSRRoute[]
  notFoundComp: React.SFC | React.ComponentClass
}

const generateRoutes = async (options: IOptions): Promise<React.SFC> => {
  const preload = options.routes.find((route) =>
    !!matchPath(options.pathname, {
      path: route.path,
      exact: route.exact || false,
      strict: route.strict || false,
    }),
  )

  const preloadedComp: IJSXModule = preload === undefined
    ? { default: options.notFoundComp }
    : await preload.component().props.mod

  const renderComp = (path: string, bundle: React.SFC) => {
    if (!preload) return bundle
    const isSSR = preload.path === path
    return isSSR ? preloadedComp.default : bundle
  }

  return () => {
    return (
      <Switch>
        {options.routes.map((props, i) => {
          const routeProps = {...props, component: renderComp(props.path, props.component) }
          return <Route key={i} {...routeProps} />
        })}
        <Route component={options.notFoundComp} />
      </Switch>
    )
  }
}

export default generateRoutes
