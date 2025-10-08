import z from "zod";

const createPatientValidationSchema = z.object({
  patient: {
    name: z.string({ error: "Name is required" }),
    email: z.string({ error: "Email is  required" }),
    address: z.string().optional(),
  },
  password: z.string,
});

export const UserValidation = {
  createPatientValidationSchema,
};
