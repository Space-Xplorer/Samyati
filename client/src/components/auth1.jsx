import { SignIn } from "@clerk/clerk-react"
import { Container, Card } from "react-bootstrap"

export default function Auth1() {
  return (
    <Container className="auth-container">
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your journey with Samyati</p>
          <div className="d-flex justify-content-center">
            <SignIn
              routing="path"
              path="/auth1"
              signUpUrl="/auth2"
              redirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-none border-0",
                  headerTitle: "d-none",
                  headerSubtitle: "d-none",
                  socialButtonsBlockButton: "border rounded mb-2 hover:bg-gray-50",
                  formButtonPrimary: "bg-primary-dark hover:bg-primary-light",
                  footerActionLink: "text-primary-dark hover:text-primary-light",
                },
              }}
            />
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}

