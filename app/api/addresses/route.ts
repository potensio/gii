import { NextRequest, NextResponse } from "next/server";
import { addressService } from "@/lib/services/address.service";
import { decodeUserId } from "@/lib/utils/token.utils";
import {
  formatErrorResponse,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors";

/**
 * GET /api/addresses
 * List all addresses for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = decodeUserId(request);
    if (!userId) {
      throw new AuthorizationError(
        "Anda harus login untuk mengakses fitur ini"
      );
    }

    const addresses = await addressService.getUserAddresses(userId);

    return NextResponse.json(
      {
        success: true,
        message: "Addresses retrieved successfully",
        data: addresses,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

/**
 * POST /api/addresses
 * Create new address for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const userId = decodeUserId(request);
    if (!userId) {
      throw new AuthorizationError(
        "Anda harus login untuk mengakses fitur ini"
      );
    }

    const body = await request.json();

    // Validate required fields
    const required = [
      "addressLabel",
      "streetAddress",
      "district",
      "city",
      "state",
      "postalCode",
    ];
    for (const field of required) {
      if (!body[field]) {
        throw new ValidationError(`${field} is required`);
      }
    }

    // Validate postal code
    if (!/^\d{5}$/.test(body.postalCode)) {
      throw new ValidationError("Kode pos harus 5 digit");
    }

    const newAddress = await addressService.createAddress(userId, {
      addressLabel: body.addressLabel,
      streetAddress: body.streetAddress,
      district: body.district,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country || "ID",
      isDefault: body.isDefault || false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Address created successfully",
        data: newAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
