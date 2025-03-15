import { SignIn, SignUp } from '@clerk/clerk-react';

export default function Auth() {
  return (
    <div className="container py-5">
<<<<<<< HEAD
      <SignIn routing="path" path="/auth1" />
      <SignUp routing="path" path="/auth2" />
=======
      <SignIn routing="path" path="/auth" />
      <SignUp routing="path" path="/auth" />
>>>>>>> 561ca75a3962599d74cb4296db87567101a3d8f0
    </div>
  );
}