"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap"
import { useAuth } from "@clerk/clerk-react"

export default function Profile() {
  const { clerkId } = useParams()
  const { userId, getToken, isSignedIn } = useAuth()

  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    profileImage: "",
    twitter: "",
    instagram: "",
    facebook: "",
  })

  const isOwnProfile = userId === clerkId

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)

        // If it's the user's own profile and they're signed in
        if (isOwnProfile && isSignedIn) {
          const token = await getToken()
          const response = await fetch("http://localhost:5000/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to fetch profile")
          }

          const data = await response.json()
          setProfile(data.user)

          // Set form data
          setFormData({
            username: data.user.username || "",
            bio: data.user.bio || "",
            profileImage: data.user.profileImage || "",
            twitter: data.user.socialLinks?.twitter || "",
            instagram: data.user.socialLinks?.instagram || "",
            facebook: data.user.socialLinks?.facebook || "",
          })
        } else {
          // Fetch public profile
          const response = await fetch(`http://localhost:5000/api/users/profile/${clerkId}`)

          if (!response.ok) {
            throw new Error("Failed to fetch profile")
          }

          const data = await response.json()
          setProfile({
            ...data.user,
            blogs: data.blogs,
          })

          // Check if current user is following this profile
          if (isSignedIn) {
            const token = await getToken()
            const userResponse = await fetch("http://localhost:5000/api/users/profile", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            if (userResponse.ok) {
              const userData = await userResponse.json()
              setIsFollowing(userData.user.following?.includes(clerkId) || false)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [clerkId, isSignedIn, isOwnProfile, userId, getToken])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (["twitter", "instagram", "facebook"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = await getToken()

      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          bio: formData.bio,
          profileImage: formData.profileImage,
          socialLinks: {
            twitter: formData.twitter,
            instagram: formData.instagram,
            facebook: formData.facebook,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()
      setProfile(data.user)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile. Please try again.")
    }
  }

  const handleFollow = async () => {
    if (!isSignedIn) return

    try {
      const token = await getToken()
      const endpoint = isFollowing ? "unfollow" : "follow"

      const response = await fetch(`http://localhost:5000/api/users/${endpoint}/${clerkId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} user`)
      }

      setIsFollowing(!isFollowing)

      // Update follower count
      if (isFollowing) {
        setProfile((prev) => ({
          ...prev,
          followersCount: prev.followersCount - 1,
        }))
      } else {
        setProfile((prev) => ({
          ...prev,
          followersCount: prev.followersCount + 1,
        }))
      }
    } catch (error) {
      console.error(`Error ${isFollowing ? "unfollowing" : "following"} user:`, error)
      setError(`Failed to ${isFollowing ? "unfollow" : "follow"} user. Please try again.`)
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
        <Button as={Link} to="/blogs" variant="primary">
          Back to Blogs
        </Button>
      </Container>
    )
  }

  if (!profile) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Profile not found</Alert>
        <Button as={Link} to="/blogs" variant="primary">
          Back to Blogs
        </Button>
      </Container>
    )
  }

  return (
    <Container className="py-5 profile-container">
      <Row>
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-center">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage || "/placeholder.svg"}
                  alt={profile.username}
                  className="profile-image"
                />
              ) : (
                <div
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: "150px", height: "150px" }}
                >
                  <span className="text-white" style={{ fontSize: "3rem" }}>
                    {profile.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}

              <h3 className="mb-2">{profile.username}</h3>

              {profile.role && (
                <div className="mb-3">
                  <span
                    className={`badge bg-${profile.role === "admin" ? "danger" : profile.role === "author" ? "success" : "primary"}`}
                  >
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </span>
                </div>
              )}

              <p className="text-muted">
                {profile.followersCount || 0} Followers • {profile.followingCount || 0} Following
              </p>

              {isOwnProfile ? (
                <Button variant="outline-primary" className="w-100" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </Button>
              ) : (
                isSignedIn && (
                  <Button
                    variant={isFollowing ? "outline-danger" : "outline-primary"}
                    className="w-100"
                    onClick={handleFollow}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )
              )}
            </Card.Body>
          </Card>

          {!isEditing && (
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">About</h5>
                <p>{profile.bio || "No bio available"}</p>

                {profile.socialLinks && Object.values(profile.socialLinks).some((link) => link) && (
                  <>
                    <h5 className="mt-4 mb-3">Connect</h5>
                    <div className="d-flex gap-2 flex-wrap">
                      {profile.socialLinks.twitter && (
                        <a
                          href={profile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          Twitter
                        </a>
                      )}
                      {profile.socialLinks.instagram && (
                        <a
                          href={profile.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-danger"
                        >
                          Instagram
                        </a>
                      )}
                      {profile.socialLinks.facebook && (
                        <a
                          href={profile.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          )}

          {isEditing && (
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Edit Profile</h5>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control as="textarea" rows={3} name="bio" value={formData.bio} onChange={handleInputChange} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Profile Image URL</Form.Label>
                    <Form.Control
                      type="text"
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </Form.Group>

                  <h5 className="mt-4 mb-3">Social Links</h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Twitter</Form.Label>
                    <Form.Control
                      type="text"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/username"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Instagram</Form.Label>
                    <Form.Control
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/username"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Facebook</Form.Label>
                    <Form.Control
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/username"
                    />
                  </Form.Group>

                  <div className="d-flex gap-2 mt-4">
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={8}>
          <h4 className="mb-4">{isOwnProfile ? "Your Blogs" : `${profile.username}'s Blogs`}</h4>

          {profile.blogs && profile.blogs.length > 0 ? (
            <Row xs={1} md={2} className="g-4">
              {profile.blogs.map((blog) => (
                <Col key={blog._id}>
                  <Card className="h-100 shadow-sm blog-card">
                    <Card.Body>
                      <Card.Title>{blog.title}</Card.Title>
                      <Card.Text>
                        <small className="text-muted">
                          {new Date(blog.createdAt).toLocaleDateString()} •{blog.likesCount || 0} likes •
                          {blog.commentsCount || 0} comments
                        </small>
                      </Card.Text>
                      <Link to={`/blogs/${blog._id}`} className="btn btn-sm btn-primary">
                        Read Blog
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              {isOwnProfile ? "You haven't written any blogs yet." : "This user hasn't written any blogs yet."}
              {isOwnProfile && (
                <div className="mt-3">
                  <Button as={Link} to="/create-blog" variant="success">
                    Write Your First Blog
                  </Button>
                </div>
              )}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  )
}

