import { IsEmail, IsNotEmpty, MinLength, MaxLength, Matches } from "class-validator";

export class RegisterDto {
  @IsNotEmpty({ message: "Name is required" })
  @MaxLength(50, { message: "Name must be at most 50 characters" })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: "Name can only contain letters and spaces",
  })
  name!: string;

  @IsEmail({}, { message: "Email must be a valid email address" })
  @MaxLength(100, { message: "Email must be at most 100 characters" })
  email!: string;

  @IsNotEmpty({ message: "Password is required" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  @MaxLength(50, { message: "Password must be at most 50 characters" })
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      "Password must contain at least one uppercase letter and one number",
  })
  password!: string;
}
