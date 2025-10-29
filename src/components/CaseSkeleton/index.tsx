import { Card, Skeleton } from "antd"

import "./styles.css"

const CaseSkeleton = () => {
  return (
    <div className="case-skeleton-root">
      <Card
        title={
          <div className="case-skeleton-title">
            <Skeleton.Input active />
          </div>
        }
        extra={
          <Skeleton.Button
            active
            size="small"
            className="case-skeleton-button"
          />
        }
      >
        <Skeleton
          active
          paragraph={{
            rows: 8,
            width: ["40%", "40%", "40%", "40%", "40%", "40%", "40%", "40%"],
          }}
          title={false}
        />
      </Card>
    </div>
  )
}

export default CaseSkeleton
