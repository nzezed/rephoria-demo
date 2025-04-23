import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      organizationId: string
      organizationSubdomain: string
    } & DefaultSession["user"]
  }

  interface User {
    organizationId: string
    organizationSubdomain: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    organizationId: string
    organizationSubdomain: string
  }
} 