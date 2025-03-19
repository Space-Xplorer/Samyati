"use client"

// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import { Container, Spinner } from "react-bootstrap"
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
import Navigation from "./components/Navigation"

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

