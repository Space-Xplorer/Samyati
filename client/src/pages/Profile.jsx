import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap"
import { useAuth, useUser } from "@clerk/clerk-react"
import { API_ENDPOINTS } from "../config/api"

export default function Profile() {
  const { clerkId } = useParams()
  const { userId, getToken, isSignedIn } = useAuth()
  const { user } = useUser()

  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userBlogs, setUserBlogs] = useState([])

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    profileImage: "",
    country: "",
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
          const response = await fetch(`${API_ENDPOINTS.users}/profile`, {
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
            profileImage: data.user.profileImage || user?.imageUrl || "",
            country: data.user.country || "",
            twitter: data.user.socialLinks?.twitter || "",
            instagram: data.user.socialLinks?.instagram || "",
            facebook: data.user.socialLinks?.facebook || "",
          })

          // Fetch user's blogs
          const blogsResponse = await fetch(`${API_ENDPOINTS.blogs}/user/${clerkId}`)
          if (blogsResponse.ok) {
            const blogsData = await blogsResponse.json()
            setUserBlogs(blogsData)
          }
        } else {
          // Fetch public profile
          const response = await fetch(`${API_ENDPOINTS.users}/profile/${clerkId}`)

          if (!response.ok) {
            throw new Error("Failed to fetch profile")
          }

          const data = await response.json()
          setProfile(data.user)

          // Fetch user's blogs
          const blogsResponse = await fetch(`${API_ENDPOINTS.blogs}/user/${clerkId}`)
          if (blogsResponse.ok) {
            const blogsData = await blogsResponse.json()
            setUserBlogs(blogsData)
          }

          // Check if current user is following this profile
          if (isSignedIn) {
            const token = await getToken()
            const userResponse = await fetch(`${API_ENDPOINTS.users}/profile`, {
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
  }, [clerkId, isSignedIn, isOwnProfile, userId, getToken, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = await getToken()

      const response = await fetch(`${API_ENDPOINTS.users}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          bio: formData.bio,
          profileImage: formData.profileImage || user?.imageUrl,
          country: formData.country,
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

      const response = await fetch(`${API_ENDPOINTS.users}/${endpoint}/${clerkId}`, {
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

      // Update follower count (work in progress)
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
      <div className="profile-container d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-container">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/blogs" variant="primary">
          Back to Blogs
        </Button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <Alert variant="warning">Profile not found</Alert>
        <Button as={Link} to="/blogs" variant="primary">
          Back to Blogs
        </Button>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <Row>
        <Col md={4}>
          <Card className="mb-4 profile-card">
            <Card.Body className="text-center">
              {profile.profileImage || user?.imageUrl ? (
                <img
                  src={profile.profileImage || user?.imageUrl || "/placeholder.svg"}
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
            <Card className="profile-card">
              <Card.Body>
                <h5 className="mb-3">About</h5>
                <p>{profile.bio || "No bio available"}</p>

                {profile.country && (
                  <div className="mb-3">
                    <h6>Country</h6>
                    <p>{profile.country}</p>
                  </div>
                )}

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
            <Card className="profile-card">
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
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself and your travel experiences..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Your country of residence"
                    />
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
                    <Form.Text className="text-muted">Leave empty to use your Clerk profile image</Form.Text>
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

          {userBlogs && userBlogs.length > 0 ? (
            <Row xs={1} md={2} className="g-4">
              {userBlogs.map((blog) => (
                <Col key={blog._id}>
                  <Card className="h-100 blog-card">
                    {blog.image && blog.image.data && (
                      <Card.Img
                        variant="top"
                        src={`data:${blog.image.contentType};base64,${blog.image.data}`}
                        alt={blog.title}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{blog.title}</Card.Title>
                      <Card.Text>
                        <small className="text-muted">
                          {new Date(blog.createdAt).toLocaleDateString()} •{blog.likes?.length || 0} likes •
                          {blog.comments?.length || 0} comments
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
              {isOwnProfile ? "You haven't written any blogs yet." : "This user did not write any blogs yet."}
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
    </div>
  )
}

