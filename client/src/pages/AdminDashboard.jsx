import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Tabs, Tab } from "react-bootstrap"
import { Link } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import { API_ENDPOINTS } from "../config/api"

export default function AdminDashboard() {
  const { getToken } = useAuth()

  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const token = await getToken()

        const response = await fetch(`${API_ENDPOINTS.admin}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const data = await response.json()
        setStats(data.stats)
        setBlogs(data.recentBlogs)

        // Fetch all users
        const usersResponse = await fetch(API_ENDPOINTS.users, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }

        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [getToken])

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = await getToken()

      const response = await fetch(`${API_ENDPOINTS.users}/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user role")
      }

      // Update users list
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    } catch (error) {
      console.error("Error updating user role:", error)
      setError("Failed to update user role. Please try again.")
    }
  }

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return
    }

    try {
      const token = await getToken()

      const response = await fetch(`${API_ENDPOINTS.admin}/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete blog")
      }

      // Remove blog from list
      setBlogs(blogs.filter((blog) => blog._id !== blogId))
    } catch (error) {
      console.error("Error deleting blog:", error)
      setError("Failed to delete blog. Please try again.")
    }
  }

  const handleFeatureBlog = async (blogId) => {
    try {
      const token = await getToken()

      const response = await fetch(`${API_ENDPOINTS.admin}/blogs/${blogId}/feature`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to feature blog")
      }

      const data = await response.json()

      // Update blog in list
      setBlogs(blogs.map((blog) => (blog._id === blogId ? { ...blog, featured: data.featured } : blog)))
    } catch (error) {
      console.error("Error featuring blog:", error)
      setError("Failed to feature blog. Please try again.")
    }
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
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
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Admin Dashboard</h2>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="overview" title="Overview">
          <Row className="g-4 mb-4">
            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h1 className="display-4">{stats?.totalUsers || 0}</h1>
                  <Card.Title>Total Users</Card.Title>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h1 className="display-4">{stats?.totalBlogs || 0}</h1>
                  <Card.Title>Total Blogs</Card.Title>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h1 className="display-4">{stats?.totalAuthors || 0}</h1>
                  <Card.Title>Authors</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>Recent Blogs</Card.Header>
                <Card.Body>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.slice(0, 5).map((blog) => (
                        <tr key={blog._id}>
                          <td>
                            <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                            {blog.featured && (
                              <Badge bg="warning" className="ms-2">
                                Featured
                              </Badge>
                            )}
                          </td>
                          <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              as={Link}
                              to={`/blogs/${blog._id}`}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card>
                <Card.Header>Recent Users</Card.Header>
                <Card.Body>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map((user) => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>
                            <Badge
                              bg={user.role === "admin" ? "danger" : user.role === "author" ? "success" : "primary"}
                            >
                              {user.role}
                            </Badge>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="users" title="Manage Users">
          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={user.role === "admin" ? "danger" : user.role === "author" ? "success" : "primary"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleRoleChange(user.id, "author")}
                            disabled={user.role === "author"}
                          >
                            Make Author
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRoleChange(user.id, "admin")}
                            disabled={user.role === "admin"}
                          >
                            Make Admin
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleRoleChange(user.id, "user")}
                            disabled={user.role === "user"}
                          >
                            Reset to User
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="blogs" title="Manage Blogs">
          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Likes</th>
                    <th>Comments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog._id}>
                      <td>
                        <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                        {blog.featured && (
                          <Badge bg="warning" className="ms-2">
                            Featured
                          </Badge>
                        )}
                      </td>
                      <td>{blog.author}</td>
                      <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                      <td>{blog.likesCount}</td>
                      <td>{blog.commentsCount}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button variant="outline-primary" size="sm" as={Link} to={`/blogs/${blog._id}`}>
                            View
                          </Button>
                          <Button
                            variant={blog.featured ? "outline-warning" : "outline-success"}
                            size="sm"
                            onClick={() => handleFeatureBlog(blog._id)}
                          >
                            {blog.featured ? "Unfeature" : "Feature"}
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteBlog(blog._id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  )
}

