import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";
import { IDoctorUpdateInput } from "./doctor.interface";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { openai } from "../../helpers/open-router";
import { extractJsonFromMessage } from "../../helpers/extractJsonFromMessage";

/**
 * 🧩 DoctorService
 * -----------------------------------------------------
 * Handles all business logic related to Doctor management,
 * including CRUD operations, filtering, pagination,
 * and AI-powered doctor recommendations.
 */

/**
 * 📋 Get All Doctors
 * -----------------------------------------------------
 * Retrieves a paginated list of doctors with filtering, sorting,
 * and optional specialty or keyword search.
 *
 * @param filters - Filtering and search parameters
 * @param options - Pagination and sorting options
 * @returns List of doctors with pagination metadata
 */
const getAllFromDB = async (filters: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

  // 🔍 Search by keyword across defined fields
  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // 🎯 Filter by specialties (case-insensitive match)
  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialities: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  // ⚙️ Apply additional filters (e.g., gender, experience, etc.)
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: { equals: (filterData as any)[key] },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 📦 Fetch doctors
  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      doctorSpecialties: { include: { specialities: true } },
      reviews: { select: { rating: true } },
    },
  });

  const total = await prisma.doctor.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: result,
  };
};

/**
 * ✏️ Update Doctor
 * -----------------------------------------------------
 * Updates a doctor's information, including their specialties.
 * Handles addition and deletion of specialties transactionally.
 *
 * @param id - Doctor ID
 * @param payload - Updated doctor data (with optional specialties)
 */
const updateIntoDB = async (id: string, payload: Partial<IDoctorUpdateInput>) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({ where: { id } });
  const { specialties, ...doctorData } = payload;

  return await prisma.$transaction(async (tnx) => {
    // 🗑️ Delete specialties marked for removal
    if (specialties && specialties.length > 0) {
      const deleteSpecialtyIds = specialties.filter((s) => s.isDeleted);
      for (const specialty of deleteSpecialtyIds) {
        await tnx.doctorSpecialties.deleteMany({
          where: { doctorId: id, specialitiesId: specialty.specialtyId },
        });
      }

      // ➕ Add new specialties
      const createSpecialtyIds = specialties.filter((s) => !s.isDeleted);
      for (const specialty of createSpecialtyIds) {
        await tnx.doctorSpecialties.create({
          data: { doctorId: id, specialitiesId: specialty.specialtyId },
        });
      }
    }

    // 🩺 Update doctor info
    const updatedData = await tnx.doctor.update({
      where: { id: doctorInfo.id },
      data: doctorData,
      include: {
        doctorSpecialties: { include: { specialities: true } },
      },
    });

    return updatedData;
  });
};

/**
 * 🔍 Get Doctor by ID
 * -----------------------------------------------------
 * Fetches a single doctor's details along with their specialties,
 * schedules, and reviews.
 *
 * @param id - Doctor ID
 * @returns Doctor object with nested data
 */
const getByIdFromDB = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
    include: {
      doctorSpecialties: { include: { specialities: true } },
      doctorSchedules: { include: { schedule: true } },
      reviews: true,
    },
  });
  return result;
};

/**
 * ❌ Delete Doctor (Hard Delete)
 * -----------------------------------------------------
 * Permanently deletes a doctor and their associated user account.
 * Uses a transaction to maintain consistency.
 */
const deleteFromDB = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.delete({ where: { id } });
    await transactionClient.user.delete({ where: { email: deleteDoctor.email } });
    return deleteDoctor;
  });
};

/**
 * 🗑️ Soft Delete Doctor
 * -----------------------------------------------------
 * Marks a doctor as deleted (isDeleted = true) and updates
 * the associated user’s status to DELETED.
 */
const softDelete = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.update({
      where: { id },
      data: { isDeleted: true },
    });

    await transactionClient.user.update({
      where: { email: deleteDoctor.email },
      data: { status: UserStatus.DELETED },
    });

    return deleteDoctor;
  });
};

/**
 * 🤖 Get AI Suggestions
 * -----------------------------------------------------
 * Uses OpenAI (via OpenRouter) to recommend the most suitable doctors
 * based on the patient’s symptoms and doctor specialties.
 *
 * @param payload - Object containing the patient's symptoms
 * @returns AI-generated doctor suggestions in JSON format
 */
const getAISuggestions = async (payload: { symptoms: string }) => {
  if (!(payload && payload.symptoms)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "symptoms is required!");
  }

  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    include: {
      doctorSpecialties: { include: { specialities: true } },
    },
  });

  console.log("doctors data loaded.......\n");
  const prompt = `
You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors.
Each doctor has specialties and years of experience.
Only suggest doctors who are relevant to the given symptoms.

Symptoms: ${payload.symptoms}

Here is the doctor list (in JSON):
${JSON.stringify(doctors, null, 2)}

Return your response in JSON format with full individual doctor data. 
`;

  console.log("analyzing......\n");
  const completion = await openai.chat.completions.create({
    model: "z-ai/glm-4.5-air:free",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI medical assistant that provides doctor suggestions.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const result = await extractJsonFromMessage(completion.choices[0].message);
  return result;
};

/**
 * 📦 Export DoctorService
 * -----------------------------------------------------
 * Exports all doctor-related service methods.
 */
export const DoctorService = {
  getAllFromDB,
  updateIntoDB,
  getByIdFromDB,
  deleteFromDB,
  softDelete,
  getAISuggestions,
};
