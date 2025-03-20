import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Container, Navbar, Nav, Button } from "react-bootstrap"
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react"

export default function Navigation() {
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
    <Navbar bg="dark" variant="dark" expand="lg" className="fixed-top w-100">
      <Container fluid>
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
            <Button as={Link} to="/auth1" className="btn-auth-primary me-2">
              Sign In
            </Button>
            <Button as={Link} to="/auth2" className="btn-auth-secondary">
              Sign Up
            </Button>
          </SignedOut>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

