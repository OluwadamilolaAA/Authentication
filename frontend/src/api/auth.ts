import { api } from "./axios";

export type SignupRole = "USER" | "ADMIN";

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export const signUp = async (role: SignupRole, data: SignupData) => {
  const endpoint = role === "ADMIN" ? "/register-admin" : "/register";
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("password", data.password);

  const res = await api.post(endpoint, formData);
  return res.data;
};


export const login = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  const res = await api.post("/login", formData);
  return res.data; 
};