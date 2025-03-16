"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Container, Card, Spinner, Alert, Form, Button } from "react-bootstrap"
import { useAuth } from "@clerk/clerk-react"

export default function BlogDetails() {
  const { id } = useParams()
  const { userId, getToken, isSignedIn } = useAuth()

  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/blogs/${id}`)

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        setBlog(data)
      } catch (error) {
        console.error("Fetch error:", error)
        setError("Failed to load blog. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [id])

  const handleLike = async () => {
    if (!isSignedIn) return

    try {
      setLiking(true)
      const token = await getToken()

      const response = await fetch(`http://localhost:5000/api/blogs/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to like blog")
      }

      // Update the blog with the new like
      const updatedBlog = { ...blog }
      if (!updatedBlog.likes.includes(userId)) {
        updatedBlog.likes.push(userId)
        setBlog(updatedBlog)
      }
    } catch (error) {
      console.error("Like error:", error)
      setError(error.message)
    } finally {
      setLiking(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!isSignedIn || !comment.trim()) return

    try {
      setSubmitting(true)
      const token = await getToken()

      const response = await fetch(`http://localhost:5000/api/blogs/${id}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add comment")
      }

      const result = await response.json()

      // Update the blog with the new comment
      const updatedBlog = { ...blog }
      updatedBlog.comments.push(result.comment)
      setBlog(updatedBlog)
      setComment("")
    } catch (error) {
      console.error("Comment error:", error)
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/blogs" className="btn btn-primary mt-3">
          Back to Blogs
        </Link>
      </Container>
    )
  }

  if (!blog) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Blog not found</Alert>
        <Link to="/blogs" className="btn btn-primary mt-3">
          Back to Blogs
        </Link>
      </Container>
    )
  }

  return (
    <Container className="py-5 blog-details-container">
      <Link to="/blogs" className="btn btn-outline-primary mb-4">
        &larr; Back to Blogs
      </Link>

      <Card className="border-0 shadow-sm">
        {blog.image && blog.image.data && (
          <Card.Img
            variant="top"
            src={`data:${blog.image.contentType};base64,${blog.image.data}`}
            alt={blog.title}
            className="img-fluid"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
        )}

        <Card.Body className="p-4">
          <h1 className="mb-3">{blog.title}</h1>

          <div className="d-flex justify-content-between mb-4">
            <small className="text-muted">Posted on {new Date(blog.createdAt).toLocaleDateString()}</small>

            <div>
              <Button
                variant={blog.likes?.includes(userId) ? "success" : "outline-success"}
                size="sm"
                disabled={!isSignedIn || liking}
                onClick={handleLike}
                className="me-2"
              >
                {liking ? "Liking..." : `❤️ ${blog.likes?.length || 0}`}
              </Button>

              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => document.getElementById("commentSection").scrollIntoView({ behavior: "smooth" })}
              >
                💬 {blog.comments?.length || 0}
              </Button>
            </div>
          </div>

          <div className="blog-content mb-5">
            {blog.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <hr />

          <div id="commentSection" className="mt-4">
            <h3 className="mb-3">Comments ({blog.comments?.length || 0})</h3>

            {isSignedIn ? (
              <Form onSubmit={handleComment} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit" disabled={submitting || !comment.trim()}>
                  {submitting ? "Posting..." : "Post Comment"}
                </Button>
              </Form>
            ) : (
              <Alert variant="info">
                <Link to="/auth1">Sign in</Link> to leave a comment
              </Alert>
            )}

            {blog.comments && blog.comments.length > 0 ? (
              <div className="comments-list mt-4">
                {blog.comments.map((comment, index) => (
                  <Card key={index} className="mb-3 shadow-sm">
                    <Card.Body>
                      <Card.Text>{comment.text}</Card.Text>
                      <Card.Subtitle className="text-muted">
                        <small>Posted on {new Date(comment.createdAt).toLocaleDateString()}</small>
                      </Card.Subtitle>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}

