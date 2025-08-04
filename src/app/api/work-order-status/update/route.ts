import { writeClient } from "@/sanity/lib/client"
import { NextResponse } from "next/server";

// Define types for the request body
interface UpdateWorkOrderStatusRequest {
  id: string;
  status: 'Mechanical' | 'Powder Paint' | 'Assembling' | 'Delivered' | 'Bill' | 'Paint' | 'Wiring';
  updatedAt: string;
}

// Define types for the response
interface SuccessResponse {
  success: true;
  data: any; // You can replace 'any' with a more specific type from Sanity if available
}

interface ErrorResponse {
  error: string;
}

export async function POST(request: Request): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const { id, status, updatedAt } = await request.json() as UpdateWorkOrderStatusRequest;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate the status value
    const validStatuses = ['Mechanical', 'Powder Paint', 'Assembling', 'Delivered', 'Bill', 'Paint', 'Wiring'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update the work order status in Sanity
    const result = await writeClient
      .patch(id)
      .set({
        "workOrderSection.status.currentStatus": status,
        "workOrderSection.status.updatedAt": updatedAt,
      })
      .commit();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating work order status:", error);
    return NextResponse.json(
      { error: "Failed to update work order status" },
      { status: 500 }
    );
  }
}