import { Access, User } from "payload";

export const isAdmin: Access = ({ req }) => {
    const user = req.user as User | undefined
  
    if (!user) return false
    if (user.role === "admin") return true;
  
    return false;
  
  }