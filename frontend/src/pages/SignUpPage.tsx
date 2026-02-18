import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/home" />
    </main>
  );
};

export default SignUpPage;
