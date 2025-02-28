import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, UserButton, useAuth, SignIn, SignUp } from '@clerk/clerk-react';
import './App.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const Home = () => {
  return (
    <div>
      <h1>Welcome to Samyati</h1>
      <p>Your ultimate travel blogging companion.</p>
      <div className="nav-links">
        <Link to="/blogs">Explore Blogs</Link>
        <Link to="/create-blog">Create Blog</Link>
      </div>
    </div>
  );
};

const Blogs = () => {
  return (
    <div>
      <h1>Travel Blogs</h1>
      <p>Explore stories from fellow travelers.</p>
    </div>
  );
};

const CreateBlog = () => {
  return (
    <div>
      <h1>Create a New Blog</h1>
      <p>Share your travel experiences with the world.</p>
    </div>
  );
};

const Auth = () => {
  return (
    <div>
      <h2>Sign In</h2>
      <SignIn />
      <h2>Sign Up</h2>
      <SignUp />
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Navigate to="/auth" />;
  }

  return children;
};

const Navbar = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/blogs">Blogs</Link>
      <Link to="/create-blog">Create Blog</Link>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <Link to="/auth">Login</Link>
      </SignedOut>
    </nav>
  );
};

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route
            path="/create-blog"
            element={
              <ProtectedRoute>
                <CreateBlog />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Router>
    </ClerkProvider>
  );
}

export default App;