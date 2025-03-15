import { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Spinner } from 'react-bootstrap';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/blogs");
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="py-5">
      <h2 className="mb-4">Recent Travel Blogs</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {blogs.map(blog => (
          <Col key={blog._id}>
            <Card className="h-100 shadow">
              {blog.image && (
                <Card.Img 
                  variant="top" 
                  src={`data:${blog.image.contentType};base64,${blog.image.data}`}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <Card.Body>
                <Card.Title>{blog.title}</Card.Title>
                <Card.Text>{blog.content.substring(0, 100)}...</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
