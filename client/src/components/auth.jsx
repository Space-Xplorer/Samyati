import { SignIn, SignUp } from '@clerk/clerk-react';

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

export default Auth;