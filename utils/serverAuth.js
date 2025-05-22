// lib/auth.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

// A universal auth function to be used in getServerSideProps
export default async function serverAuth(context) {
  try {
    const session = await getServerSession(context.req, context.res, authOptions);
    return {
      props: {
        isLoggedIn: !!session,
        user: session?.user || null,
      },
    };
  } catch (error) {
    console.error("Error checking authentication:", error);
    return {
      props: {
        isLoggedIn: false,
        user: null,
        error: "An error occurred while checking authentication",
      },
    };
  }
}
