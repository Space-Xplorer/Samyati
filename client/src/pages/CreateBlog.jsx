"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Form, Spinner, Container, Alert, Card } from "react-bootstrap"
import { useAuth } from "@clerk/clerk-react"

export default function CreateBlog() {
  const { getToken } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = await getToken() // This gets the Clerk session token
      console.log("Clerk Token:", token)

      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      if (image) formData.append("image", image)

      const response = await fetch("http://localhost:5000/api/blogs", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      console.log("Server Response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to post blog")
      }

      navigate("/blogs")
    } catch (err) {
      setError(err.message)
      console.error("Submission error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Write a Blog</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Blog Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                placeholder="Write your blog content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="form-control-lg"
              />
              <Form.Text className="text-muted">Share your travel experiences, tips, and stories.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
              <Form.Text className="text-muted">Add a cover image for your blog (optional).</Form.Text>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={loading} size="lg" className="py-2">
                {loading ? <Spinner animation="border" size="sm" /> : "Post Blog"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

