export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: userRole;
 };
 
 export type userRole = "user" | "admin";


 export interface RegisterResponse {
    message: string;
    user: User
 }

 export interface User {
    _id: string;
    name: string;
    email: string;
    role: userRole;
    createdAt: string;
    updatedAt: string;
 }

 export interface LoginRequest {
    email: string;
    password: string;
 }

 export interface LoginResponse {
    message: string;
    user: User;
    token: string;
 }


 export interface getUserByIdResponse {
    message: string;
    user: User;
 }