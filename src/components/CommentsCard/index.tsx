import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Input, List, Typography, Popconfirm, App as AntApp, Empty } from 'antd'
import { DeleteOutlined, SendOutlined } from '@ant-design/icons'
import { ApiService } from '../../services'
import type { Comment } from '../../types/comment'
import { useNotifications } from '../../hooks/use-notifications.hook'
import './styles.css'

const { Text } = Typography
const { TextArea } = Input

interface CommentsPanelProps {
  caseCode: string
}

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_COMMENT_SORT_BY = 'createdAt'

const CommentsPanel: React.FC<CommentsPanelProps> = ({ caseCode }) => {
  const [newComment, setNewComment] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()
  const { message } = AntApp.useApp()
  const { notify, contextHolder: notificationContextHolder } = useNotifications()

  const { data: commentsData, isLoading: isCommentsLoading, error: commentsError } = useQuery({
    queryKey: ['case-comments', caseCode, currentPage, DEFAULT_PAGE_SIZE],
    queryFn: () => ApiService.getCaseComments(caseCode, { page: currentPage, size: DEFAULT_PAGE_SIZE, sort: DEFAULT_COMMENT_SORT_BY }),
    enabled: !!caseCode,
  })

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => ApiService.addCaseComment(caseCode, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-comments', caseCode] })
      queryClient.invalidateQueries({ queryKey: ['case-history', caseCode] })
      setNewComment('')
      message.success('Comment added successfully')
    },
    onError: (error) => {
      notify.error(error, 'Failed to add comment')
    }
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentUid: string) => ApiService.deleteCaseComment(caseCode, commentUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-comments', caseCode] })
      queryClient.invalidateQueries({ queryKey: ['case-history', caseCode] })
      message.success('Comment deleted successfully')
    },
    onError: (error) => {
      notify.error(error, 'Failed to delete comment')
    }
  })

  const handleAddComment = () => {
    addCommentMutation.mutate(newComment.trim())
  }

  const handleDeleteComment = (commentUid: string) => {
    deleteCommentMutation.mutate(commentUid)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <>
      {notificationContextHolder}
      <Card
        title={<div className="comments-title">Comments ({commentsData?.totalCount || 0})</div>}
        className="comments-panel"
      >
        <div className="comments-container">
          <div className="comments-list">
            {isCommentsLoading ? (
              <div className="comments-loading">Loading comments...</div>
            ) : commentsError ? (
              <div className="comments-error">Failed to load comments</div>
            ) : (
              <List
                dataSource={commentsData?.items || []}
                locale={{ emptyText: <Empty description="No comments yet" /> }}
                pagination={{
                  current: currentPage,
                  pageSize: DEFAULT_PAGE_SIZE,
                  total: commentsData?.totalCount || 0,
                  onChange: handlePageChange,
                  hideOnSinglePage: true,
                  showSizeChanger: false,
                }}
                renderItem={(comment: Comment) => (
                  <List.Item
                    className="comment-item"
                    actions={[
                      <Popconfirm
                        key="delete"
                        title="Delete comment"
                        description="Are you sure you want to delete this comment?"
                        onConfirm={() => handleDeleteComment(comment.uid)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          size="small"
                          danger
                        />
                      </Popconfirm>
                    ]}
                  >
                    <div className="comment-content">
                      <div className="comment-header">
                        <Text strong>{comment.createdByName}</Text>
                        <Text type="secondary" className="comment-date">
                          {formatDate(comment.createdAt)}
                        </Text>
                      </div>
                      <div className="comment-text">{comment.content}</div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
          <div className="comment-input-container">
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              autoSize={{ minRows: 2, maxRows: 6 }}
              className="comment-input"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleAddComment}
              disabled={newComment.trim().length === 0}
              loading={addCommentMutation.isPending}
              className="comment-send-button"
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}

export default CommentsPanel