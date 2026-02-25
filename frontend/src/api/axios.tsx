import axios, { type AxiosResponse } from "axios";
import type {
  getUserByIdResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/auth",
  withCredentials: true,
});

export const register = (payload: RegisterRequest) =>
  api.post<RegisterResponse, AxiosResponse<RegisterResponse>, RegisterRequest>(
    "/register",
    payload
  );

export const login = (payload: LoginRequest) =>
  api.post<LoginResponse, AxiosResponse<LoginResponse>, LoginRequest>(
    "/login",
    payload
  );


  export const getUserById = (id: string) =>
    api.get<getUserByIdResponse, AxiosResponse<getUserByIdResponse>>(`/users/${id}`)