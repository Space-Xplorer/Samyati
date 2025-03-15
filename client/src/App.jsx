<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
=======
// App.jsx
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/clerk-react';
>>>>>>> 561ca75a3962599d74cb4296db87567101a3d8f0
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

<<<<<<< HEAD
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import CreateBlog from './pages/CreateBlog';
import Auth1 from './components/auth1';
import Auth2 from './components/auth2';
=======
// Pages
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import CreateBlog from './pages/CreateBlog';
import Auth from './pages/Auth';
>>>>>>> 561ca75a3962599d74cb4296db87567101a3d8f0

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-section">
      <div className="hero-content text-center">
        <h1 className="hero-title">Discover Travel Stories</h1>
        <div className="hero-buttons mt-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="me-3"
            onClick={() => navigate('/blogs')}
          >
            Explore Blogs
          </Button>
          <SignedIn>
            <Button 
              variant="success" 
              size="lg"
              onClick={() => navigate('/create-blog')}
            >
              Write a Blog
            </Button>
          </SignedIn>
          <SignedOut>
            <Button 
              variant="success" 
              size="lg"
<<<<<<< HEAD
              onClick={() => navigate('/auth1')}
=======
              onClick={() => navigate('/auth')}
>>>>>>> 561ca75a3962599d74cb4296db87567101a3d8f0
            >
              Sign In to Write
            </Button>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

const Navigation = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="fixed-top">
      <Container>
        <Navbar.Brand as={Link} to="/">Samyati</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/blogs">All Blogs</Nav.Link>
          </Nav>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
<<<<<<< HEAD
            <Button as={Link} to="/auth1" variant="outline-light">
              Sign In
            </Button>
            <Button as={Link} to="/auth2" variant="outline-light">
              Sign Up
            </Button>
=======
            <Button as={Link} to="/auth" variant="outline-light">
              Sign In
            </Button>
>>>>>>> 561ca75a3962599d74cb4296db87567101a3d8f0
          </SignedOut>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/create-blog" element={<CreateBlog />} />
<<<<<<< HEAD
        <Route path="/auth1" element={<Auth1 />} />
        <Route path="/auth2" element={<Auth2 />} />
      </Routes>
    </Router>
  );
}
=======
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
}
>>>>>>> 561ca75a3962599d74cb4296db87567101a3d8f0
