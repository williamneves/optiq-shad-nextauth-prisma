import { withAuth } from "next-auth/middleware";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    console.log(req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log(token);
        console.log(req);

        return true;
      },
    },
    jwt: {
       decode(params) {
          
      },
    }
  },
);

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
