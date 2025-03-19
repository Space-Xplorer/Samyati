import { SignUp } from "@clerk/clerk-react"
import { Container, Card } from "react-bootstrap"

export default function Auth2() {
  return (
    <Container className="auth-container">
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <h2 className="auth-title">Join Samyati</h2>
          <p className="auth-subtitle">Create an account to share your travel stories</p>
          <div className="d-flex justify-content-center">
            <SignUp
              routing="path"
              path="/auth2"
              signInUrl="/auth1"
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

