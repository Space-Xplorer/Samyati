import { useEffect, useState } from "react"
import { Card, Row, Col, Spinner, Alert, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { API_ENDPOINTS } from "../config/api"

export default function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.blogs)

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Fetched blogs:", data)
        setBlogs(data)
      } catch (error) {
        console.error("Fetch error:", error)
        setError("Failed to load blogs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  if (loading) {
    return (
      <div className="blogs-container d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blogs-container">
        <Alert variant="danger">{error}</Alert>
      </div>
    )
  }

  if (blogs.length === 0) {
    return (
      <div className="blogs-container">
        <h2 className="mb-4">Recent Travel Blogs</h2>
        <Alert variant="info">
          <p>No blogs found. Be the first to share your travel story!</p>
          <div className="mt-3">
            <Button as={Link} to="/create-blog" variant="success">
              Write a Blog
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="blogs-container">
      <h2 className="mb-4">Recent Travel Blogs</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {blogs.map((blog) => (
          <Col key={blog._id}>
            <Card className="h-100 blog-card">
              {blog.image && blog.image.data && (
                <Card.Img
                  variant="top"
                  src={`data:${blog.image.contentType};base64,${blog.image.data}`}
                  alt={blog.title}
                />
              )}
              <Card.Body>
                <Card.Title>{blog.title}</Card.Title>
                <Card.Text>
                  {blog.content.length > 100 ? `${blog.content.substring(0, 100)}...` : blog.content}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <Link to={`/blogs/${blog._id}`} className="btn btn-primary">
                    Read More
                  </Link>
                  <small className="text-muted">{new Date(blog.createdAt).toLocaleDateString()}</small>
                </div>
              </Card.Body>
              <Card.Footer className="text-muted d-flex justify-content-between">
                <span>❤️ {blog.likes?.length || 0}</span>
                <span>💬 {blog.comments?.length || 0}</span>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

