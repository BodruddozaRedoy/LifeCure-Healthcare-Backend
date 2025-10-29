import { Patient, Prisma, UserStatus } from '@prisma/client';
import { IPatientFilterRequest } from "./patient.interface";
import { patientSearchableFields } from "./patient.constant";
import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

/**
 * 🧑‍⚕️ PatientService
 * -----------------------------------------------------
 * Handles all database operations related to patients.
 * Includes CRUD, filtering, pagination, and relational updates.
 */

/**
 * 📋 Get All Patients
 * -----------------------------------------------------
 * Retrieves a paginated list of patients with support for
 * search, filtering, and sorting.
 *
 * @param filters - Filtering and search parameters
 * @param options - Pagination and sorting options
 * @returns Paginated list of patients with metadata
 */
const getAllFromDB = async (
  filters: IPatientFilterRequest,
  options: IOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  // 🔍 Apply search across multiple patient fields
  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  // ⚙️ Apply exact-match filters for specific fields
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  // Exclude soft-deleted patients
  andConditions.push({ isDeleted: false });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 📦 Fetch filtered and paginated data
  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' },
  });

  const total = await prisma.patient.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: result,
  };
};

/**
 * 🔍 Get Patient by ID
 * -----------------------------------------------------
 * Retrieves details for a single patient by their unique ID.
 *
 * @param id - Patient ID
 * @returns Patient record or null if not found
 */
const getByIdFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: { id, isDeleted: false },
  });
  return result;
};

/**
 * 🗑️ Soft Delete Patient
 * -----------------------------------------------------
 * Marks a patient as deleted instead of permanently removing
 * them from the database. Also updates their associated user status.
 *
 * @param id - Patient ID to soft delete
 * @returns Updated patient record
 */
const softDelete = async (id: string): Promise<Patient | null> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deletedPatient = await transactionClient.patient.update({
      where: { id },
      data: { isDeleted: true },
    });

    await transactionClient.user.update({
      where: { email: deletedPatient.email },
      data: { status: UserStatus.DELETED },
    });

    return deletedPatient;
  });
};

/**
 * ✏️ Update Patient Info
 * -----------------------------------------------------
 * Updates patient information along with their related
 * health data and medical reports.
 *
 * @param user - Authenticated patient from JWT payload
 * @param payload - Updated patient, health, and report data
 * @returns Updated patient record with relations
 */
const updateIntoDB = async (user: IJWTPayload, payload: any) => {
  const { medicalReport, patientHealthData, ...patientData } = payload;

  // Ensure patient exists and is active
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email, isDeleted: false },
  });

  return await prisma.$transaction(async (tnx) => {
    // 🧠 Update basic patient info
    await tnx.patient.update({
      where: { id: patientInfo.id },
      data: patientData,
    });

    // ❤️ Upsert patient health data
    if (patientHealthData) {
      await tnx.patientHealthData.upsert({
        where: { patientId: patientInfo.id },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: patientInfo.id },
      });
    }

    // 📄 Add a new medical report entry (if provided)
    if (medicalReport) {
      await tnx.medicalReport.create({
        data: { ...medicalReport, patientId: patientInfo.id },
      });
    }

    // 📦 Fetch and return updated data with relations
    const result = await tnx.patient.findUnique({
      where: { id: patientInfo.id },
      include: {
        patientHealthData: true,
        medicalReports: true,
      },
    });

    return result;
  });
};

/**
 * 📦 Export PatientService
 * -----------------------------------------------------
 * Exposes all patient-related database operations.
 */
export const PatientService = {
  getAllFromDB,
  getByIdFromDB,
  softDelete,
  updateIntoDB,
};
