export enum RoleType {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface EmailType {
  from: string;
  to: string;
  subject: string;
  html: string;
}
export interface UserType {
  id: number;
  name: string;
  email: string;
  password: string;
  role: RoleType;
}
