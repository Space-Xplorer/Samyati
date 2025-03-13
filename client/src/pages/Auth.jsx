import { SignIn, SignUp } from '@clerk/clerk-react';

export default function Auth() {
  return (
    <div className="container py-5">
      <SignIn routing="path" path="/auth" />
      <SignUp routing="path" path="/auth" />
    </div>
  );
}