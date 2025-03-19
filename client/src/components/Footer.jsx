import { Container, Row, Col } from "react-bootstrap"
import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-4 w-100">
      <Container className="w-100">
        <Row className="w-100">
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Samyati</h5>
            <p className="text-white">Share your travel stories with the world.</p>
          </Col>

          <Col md={4} className="mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-white-50 text-decoration-none hover-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-white-50 text-decoration-none hover-white">
                  Blogs
                </Link>
              </li>
              <li>
                <Link to="/create-blog" className="text-white-50 text-decoration-none hover-white">
                  Write a Blog
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={4}>
            <h5>Connect With Us</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-white-50 text-decoration-none hover-white">
                <i className="bi bi-facebook"></i> Facebook
              </a>
              <a href="#" className="text-white-50 text-decoration-none hover-white">
                <i className="bi bi-twitter"></i> Twitter
              </a>
              <a href="#" className="text-white-50 text-decoration-none hover-white">
                <i className="bi bi-instagram"></i> Instagram
              </a>
            </div>
          </Col>
        </Row>

        <div className="text-center mt-4 w-100">
          <p className="text-white mb-0">&copy; {new Date().getFullYear()} Samyati. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  )
}

