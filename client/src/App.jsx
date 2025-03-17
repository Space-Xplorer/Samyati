import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react"
import { Container, Navbar, Nav, Button, Spinner } from "react-bootstrap"
import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

import Home from "./pages/Home"
import Blogs from "./pages/Blogs"
import BlogDetails from "./pages/BlogDetails"
import CreateBlog from "./pages/CreateBlog"
import Profile from "./pages/Profile"
import AdminDashboard from "./pages/AdminDashboard"
import Auth1 from "./components/auth1"
import Auth2 from "./components/auth2"
import Footer from "./components/Footer"

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
        <Navbar.Brand href="/">Samyati</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/blogs">All Blogs</Nav.Link>
            {isSignedIn && (
              <>
                <Nav.Link href="/create-blog">Write a Blog</Nav.Link>
                <Nav.Link href={`/profile/${userId}`}>My Profile</Nav.Link>
                {userRole === "admin" && <Nav.Link href="/admin">Admin Dashboard</Nav.Link>}
              </>
            )}
          </Nav>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Button href="/auth1" variant="outline-light" className="me-2">
              Sign In
            </Button>
            <Button href="/auth2" variant="outline-light">
              Sign Up
            </Button>
          </SignedOut>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navigation />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
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

