import { Col, Layout, Row, Typography } from 'antd'
import { Outlet } from '@tanstack/react-router'

import './styles.css'
import Breadcrumbs from '../Breadcrumbs'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import LoginInfo from '../LoginInfo'

const { Header, Content } = Layout
const { Title } = Typography

const AppOutlet = () => {
  return (
    <Layout className="outlet-layout">
      <Header className="outlet-header">
        <Title level={3} className="outlet-title">Case Management</Title>
        <div className="outlet-header-right">
          <LoginInfo/>
          <ThemeToggle/>
        </div>
      </Header>
      <Breadcrumbs/>
      <Content>
        <Row>
          <Col span={24} offset={0}>
            <Outlet/>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}

export default AppOutlet
