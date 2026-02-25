import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "@/api/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/userStore";
import type { userRole } from "@/api/types";


export function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [role, setRole] = useState<userRole>("user");
  const [errors, setErrors] = useState<string | null>(null);

  const { setUser } = useUserStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      });
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setErrors(
        err.response?.data?.message || err.message || "Signup failed"
      );
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errors && (
            <p className="text-sm text-red-500 mb-4">{errors}</p>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Account Type</FieldLabel>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={role === "user"}
                      onChange={() => setRole("user")}
                    />
                    User
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={role === "admin"}
                      onChange={() => setRole("admin")}
                    />
                    Admin
                  </label>
                </div>
              </Field>

              <Field className="space-y-2">
                <Button type="submit" className="w-full">
                  Create Account
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                >
                  Sign up with Google
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a href="/login" className="underline">
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
