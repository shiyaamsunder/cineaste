import NextAuth from "next-auth";
import { authOptions } from "@cineaste/server/auth";

export default NextAuth(authOptions);
