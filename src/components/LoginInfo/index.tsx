import { Button, Typography } from "antd"
import { LogoutOutlined, UserOutlined } from "@ant-design/icons"
import type React from "react"
import { useEffect, useState } from "react"
import { signOut } from "aws-amplify/auth"
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito"
import "./styles.css"
import { type CognitoUser, renderUser } from "../../types/auth.ts"
import { useLocalAuth } from "../../hooks/use-local-auth.hook.ts"
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint"

const { Text } = Typography

const LoginInfo: React.FC = () => {
  const [username, setUsername] = useState<string>("")
  const localAuth = useLocalAuth()
  const { xs, md } = useBreakpoint()
  const isMediumOrLarger = !xs && md

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const tokens = await cognitoUserPoolsTokenProvider.getTokens()
        const idToken = tokens?.idToken?.toString()

        if (idToken) {
          const parsedUser = JSON.parse(
            atob(idToken.split(".")[1]),
          ) as CognitoUser

          setUsername(parsedUser ? renderUser(parsedUser) : "")
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    fetchUserInfo().catch((error) => console.log(error))
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      await localAuth.signOut()
      window.location.replace(`${window.location.origin}`)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="login-info">
      {isMediumOrLarger && (
        <div className="user-info">
          <UserOutlined className="user-icon" />
          <Text className="username">{username}</Text>
        </div>
      )}

      <Button
        type="link"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        className="logout-button"
      >
        Logout
      </Button>
    </div>
  )
}

export default LoginInfo
