import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Spinner, Container, Alert } from "react-bootstrap";
import { useAuth } from '@clerk/clerk-react';

export default function CreateBlog() {
  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = await getToken(); // This gets the Clerk session token
      console.log("Clerk Token:", token);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      const response = await fetch("http://localhost:5000/api/blogs", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      console.log("Server Response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to post blog");
      }
  
      navigate("/blogs");
    } catch (err) {
      setError(err.message);
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Write a Blog</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} className="shadow p-4 bg-white rounded">
        <Form.Group className="mb-3">
          <Form.Label>Blog Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            placeholder="Write your blog content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading} className="w-100 btn-primary">
          {loading ? <Spinner animation="border" size="sm" /> : "Post Blog"}
        </Button>
      </Form>
    </Container>
  );
}
