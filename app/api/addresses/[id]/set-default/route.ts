import { NextRequest, NextResponse } from "next/server";
import { addressService } from "@/lib/services/address.service";
import { decodeUserId } from "@/lib/utils/token.utils";
import {
  formatErrorResponse,
  AuthorizationError,
  NotFoundError,
} from "@/lib/errors";

/**
 * POST /api/addresses/[id]/set-default
 * Set address as default
 */
export async function POST(
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

    const success = await addressService.setDefaultAddress(params.id, userId);
    if (!success) {
      throw new NotFoundError("Alamat tidak ditemukan");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Default address updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
