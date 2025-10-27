import { useEffect } from "react"
import { useAuth } from "react-oidc-context"
import Cookies from "js-cookie"
import type { User } from "oidc-client-ts"
import { redirect } from "@tanstack/react-router";

const cognitoClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID

const setCookie = (key: string, value: string, expires: number) => {
  Cookies.set(key, value, {
    path: "/",
    secure: true,
    expires: expires / (24 * 60 * 60), // Convert seconds to days
  })
}

const setCookies = async (user: User) => {
  const idTokenPayload = JSON.parse(
    atob(user?.id_token?.toString().split(".")[1] || ""),
  )
  const userSub = idTokenPayload.sub

  const cookiePrefix = `CognitoIdentityServiceProvider.${cognitoClientId}.${userSub}`

  // Set access token
  if (user.access_token) {
    setCookie(`${cookiePrefix}.accessToken`, user.access_token.toString(), 600) // 10 min
  }

  // Set refresh token
  if (user.refresh_token) {
    setCookie(
      `${cookiePrefix}.refreshToken`,
      user.refresh_token.toString(),
      30 * 24 * 3600,
    ) // 30 days
  }

  // Set ID token
  if (user.id_token) {
    setCookie(`${cookiePrefix}.idToken`, user.id_token.toString(), 3600) // 1 hour
  }

  // Set LastAuthUser
  if (userSub) {
    setCookie(
      `CognitoIdentityServiceProvider.${cognitoClientId}.LastAuthUser`,
      userSub,
      3600,
    ) // 1 hour
  }

  setCookie(`${cookiePrefix}.clockDrift`, "0", 30 * 24 * 3600) // 30 days
}

export const useLocalAuth = () => {
  const auth = useAuth()
  const isLocalHost =
    location.host.includes("local.portal.io") ||
    location.host.includes("localhost")

  useEffect(() => {
    if (auth.isAuthenticated && isLocalHost) {
      const saveTokensToCookies = async () => {
        try {
          if (auth.user) {
            await setCookies(auth.user)
          } else {
            console.error("Failed to setCookies: auth.user is null")
          }
        } catch (error) {
          console.error("Error saving tokens to cookies:", error)
        }
      }
      saveTokensToCookies().catch((error) =>
        console.error("Error saving tokens to cookies:", error),
      )
    }
  }, [auth, isLocalHost])

  useEffect(() => {
    const makeLocalAuth = async () => {
      if (!auth.isLoading && !auth.isAuthenticated) {
        await auth.signinRedirect()
      }
    }

    if (isLocalHost) {
      makeLocalAuth().catch((error) =>
        console.error("Error making local auth:", error),
      )
    } else {
      redirect({ to: import.meta.env.VITE_LOGIN_PAGE_URL })
    }
  }, [auth, isLocalHost])

  const signOut = async () => {
    if (isLocalHost) {
      await auth.signoutRedirect()
    }
  }

  return { signOut }
}
