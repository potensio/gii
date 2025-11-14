import { NextRequest, NextResponse } from "next/server";
import { addressService } from "@/lib/services/address.service";
import { decodeUserId } from "@/lib/utils/token.utils";
import {
  formatErrorResponse,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";

/**
 * GET /api/addresses/[id]
 * Get single address by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = decodeUserId(request);
    if (!userId) {
      throw new AuthorizationError(
        "Anda harus login untuk mengakses fitur ini"
      );
    }

    const address = await addressService.getAddressById(params.id, userId);
    if (!address) {
      throw new NotFoundError("Alamat tidak ditemukan");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Address retrieved successfully",
        data: address,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

/**
 * PATCH /api/addresses/[id]
 * Update address by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = decodeUserId(request);
    if (!userId) {
      throw new AuthorizationError(
        "Anda harus login untuk mengakses fitur ini"
      );
    }

    const body = await request.json();

    // Validate phone number if provided
    if (body.phoneNumber && body.phoneNumber.length < 10) {
      throw new ValidationError("Nomor telepon minimal 10 digit");
    }

    // Validate postal code if provided
    if (body.postalCode && !/^\d{5}$/.test(body.postalCode)) {
      throw new ValidationError("Kode pos harus 5 digit");
    }

    const updated = await addressService.updateAddress(params.id, userId, body);
    if (!updated) {
      throw new NotFoundError("Alamat tidak ditemukan");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Address updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

/**
 * DELETE /api/addresses/[id]
 * Delete address by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = decodeUserId(request);
    if (!userId) {
      throw new AuthorizationError(
        "Anda harus login untuk mengakses fitur ini"
      );
    }

    const success = await addressService.deleteAddress(params.id, userId);
    if (!success) {
      throw new NotFoundError("Alamat tidak ditemukan");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Address deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
