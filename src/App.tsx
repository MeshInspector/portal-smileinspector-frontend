import { createRootRoute, createRoute, createRouter, redirect, RouterProvider } from '@tanstack/react-router'
import { z } from 'zod'

import './App.css'
import CaseListPage from './pages/CaseListPage'
import CasePage from './pages/CasePage'
import AppOutlet from './components/Outlet/Outlet.tsx'

const rootRoute = createRootRoute()

const redirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: () => { throw redirect({ to: '/cases' }) },
  component: () => null,
})

const outletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cases',
  component: AppOutlet,
})

const casesRoute = createRoute({
  getParentRoute: () => outletRoute,
  path: '/',
  component: CaseListPage,
  validateSearch: z.object({
    page: z.coerce.number().optional(),
    size: z.coerce.number().optional(),
    sort: z.string().optional(),
  }),
})

const caseRoute = createRoute({
  getParentRoute: () => outletRoute,
  path: '$code',
  component: CasePage,
  preload: true,
})

const filePreviewRoute = createRoute({
  getParentRoute: () => outletRoute,
  path: '$code/preview/$fileUid',
  component: CasePage,
  preload: true,
})

const routeTree = rootRoute.addChildren([
  redirectRoute,
  outletRoute.addChildren([
    casesRoute,
    caseRoute,
    filePreviewRoute,
  ]),
])

const router = createRouter({
  routeTree,
})

function App() {
  return <RouterProvider router={router}/>
}

export default App
