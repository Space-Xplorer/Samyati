"use client"

import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Button, Card } from "react-bootstrap"
import { SignedIn, SignedOut } from "@clerk/clerk-react"
import DestinationsCarousel from "../components/DestinationsCarousel"

export default function Home() {
  const navigate = useNavigate()

  return (
    <>
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Travel Stories</h1>
          <p className="hero-subtitle">Share your adventures and connect with fellow travelers around the world</p>
          <div className="hero-buttons mt-4">
            <Button variant="primary" size="lg" className="me-md-3" onClick={() => navigate("/blogs")}>
              Explore Blogs
            </Button>
            <SignedIn>
              <Button variant="success" size="lg" onClick={() => navigate("/create-blog")}>
                Write a Blog
              </Button>
            </SignedIn>
            <SignedOut>
              <Button variant="success" size="lg" onClick={() => navigate("/auth1")}>
                Sign In to Write
              </Button>
            </SignedOut>
          </div>
        </div>
      </div>

      <DestinationsCarousel />

      <section className="about-section">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} className="text-center mb-5">
              <h2 className="about-title">What is Samyati?</h2>
              <p className="about-text">
                Samyati is a Sanskrit word that means "journey" or "travel." Our platform is dedicated to travelers who
                want to share their experiences, connect with like-minded adventurers, and discover new destinations
                through authentic stories.
              </p>
            </Col>
          </Row>

          <Row>
            <Col md={4} className="mb-4">
              <Card className="feature-card">
                <Card.Body className="text-center">
                  <div className="feature-icon">✍️</div>
                  <Card.Title>Share Your Stories</Card.Title>
                  <Card.Text>
                    Create beautiful travel blogs with photos and detailed descriptions of your adventures. Help others
                    discover hidden gems and travel tips.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card className="feature-card">
                <Card.Body className="text-center">
                  <div className="feature-icon">🌍</div>
                  <Card.Title>Discover Places</Card.Title>
                  <Card.Text>
                    Explore destinations through the eyes of fellow travelers. Find authentic experiences and
                    off-the-beaten-path locations for your next trip.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card className="feature-card">
                <Card.Body className="text-center">
                  <div className="feature-icon">👥</div>
                  <Card.Title>Connect with Travelers</Card.Title>
                  <Card.Text>
                    Follow other travelers, comment on their blogs, and build a network of friends who share your
                    passion for exploration and adventure.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-5">
            <Col className="text-center">
              <h3>Ready to start your journey?</h3>
              <div className="mt-4">
                <Button variant="primary" size="lg" className="me-3" onClick={() => navigate("/blogs")}>
                  Browse Travel Blogs
                </Button>
                <SignedOut>
                  <Button variant="outline-primary" size="lg" onClick={() => navigate("/auth2")}>
                    Join Samyati
                  </Button>
                </SignedOut>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  )
}

