import z from "zod";

const createPatientValidationSchema = z.object({
  patient: z.object({
    name: z.string().nonempty("Name is required"),
    email: z.string().nonempty("Email is  required"),
    address: z.string().optional(),
  }),
  password: z.string(),
});

export const UserValidation = {
  createPatientValidationSchema,
};
