import type React from "react"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { App as AntApp } from "antd"
import "antd/dist/reset.css"
import { AuthProvider } from "react-oidc-context"
import type { AuthProviderProps } from "react-oidc-context"

import "./styles/global.css"
import "./auth/amplify-config.ts"
import App from "./App.tsx"
import ThemeProvider from "./contexts/ThemeContext.tsx"
import ThemeWrapper from "./components/ThemeWrapper/ThemeWrapper.tsx"

const queryClient = new QueryClient()

const oidcConfig: AuthProviderProps = {
  authority: `https://cognito-idp.us-east-1.amazonaws.com/${import.meta.env.VITE_COGNITO_USER_POOL_ID}`,
  client_id: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
  redirect_uri: `${window.location.origin}/`,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid phone profile",
  post_logout_redirect_uri: `${window.location.origin}`,
}

const RootApp: React.ReactNode = (
  <StrictMode>
    <AntApp>
      <AuthProvider {...oidcConfig}>
        <QueryClientProvider client={queryClient}>
          <ThemeWrapper>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </ThemeWrapper>
        </QueryClientProvider>
      </AuthProvider>
    </AntApp>
  </StrictMode>
)

createRoot(document.getElementById("root")!).render(RootApp)
