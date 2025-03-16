"use client"

// App.jsx
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom"
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react"
import { Container, Navbar, Nav, Button, Spinner } from "react-bootstrap"
import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"
import Blogs from "./pages/Blogs"
import BlogDetails from "./pages/BlogDetails"
import CreateBlog from "./pages/CreateBlog"
import Profile from "./pages/Profile"
import AdminDashboard from "./pages/AdminDashboard"
import Auth1 from "./components/auth1"
import Auth2 from "./components/auth2"

// Protected route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { userId, getToken, isSignedIn } = useAuth()
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isSignedIn) {
        setLoading(false)
        return
      }

      try {
        const token = await getToken()
        const response = await fetch("http://localhost:5000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUserRole(data.user.role)
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [isSignedIn, getToken, userId])

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/auth1" />
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />
  }

  return children
}

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Discover Travel Stories</h1>
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
  )
}

const Navigation = () => {
  const { userId, isSignedIn } = useAuth()
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isSignedIn || !userId) return

      try {
        // First try to get the user profile directly
        const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`)

        if (response.ok) {
          const data = await response.json()
          setUserRole(data.user.role)
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
      }
    }

    if (isSignedIn && userId) {
      fetchUserRole()
    }
  }, [isSignedIn, userId])

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="fixed-top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Samyati
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/blogs">
              All Blogs
            </Nav.Link>
            {isSignedIn && (
              <>
                <Nav.Link as={Link} to="/create-blog">
                  Write a Blog
                </Nav.Link>
                <Nav.Link as={Link} to={`/profile/${userId}`}>
                  My Profile
                </Nav.Link>
                {userRole === "admin" && (
                  <Nav.Link as={Link} to="/admin">
                    Admin Dashboard
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Button as={Link} to="/auth1" variant="outline-light" className="me-2">
              Sign In
            </Button>
            <Button as={Link} to="/auth2" variant="outline-light">
              Sign Up
            </Button>
          </SignedOut>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4">
      <Container>
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Samyati</h5>
            <p className="text-muted">Share your travel stories with the world.</p>
          </div>

          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-decoration-none text-muted">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-decoration-none text-muted">
                  Blogs
                </Link>
              </li>
              <li>
                <Link to="/create-blog" className="text-decoration-none text-muted">
                  Write a Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4">
            <h5>Connect With Us</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted">
                <i className="bi bi-facebook"></i>Facebook
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-twitter"></i>Twitter
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-instagram"></i>Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="mb-0">&copy; {new Date().getFullYear()} Samyati. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  )
}

export default function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navigation />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogDetails />} />
            <Route
              path="/create-blog"
              element={
                <ProtectedRoute>
                  <CreateBlog />
                </ProtectedRoute>
              }
            />
            <Route path="/profile/:clerkId" element={<Profile />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/auth1" element={<Auth1 />} />
            <Route path="/auth2" element={<Auth2 />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

