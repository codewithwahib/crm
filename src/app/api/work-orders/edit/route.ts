import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/sanity.client"; // ✅ must use write token client

export async function POST(req: Request) {
  try {
    const { id, updatedData } = await req.json();

    if (!id || !updatedData) {
      return NextResponse.json({ error: "Missing ID or update data" }, { status: 400 });
    }

    const updatedDoc = await writeClient
      .patch(id)
      .set(updatedData)
      .commit();

    return NextResponse.json({ message: "Work order updated", updatedDoc });
  } catch (err: any) {
    console.error("Update error:", err.message);
    return NextResponse.json({ error: "Failed to update work order" }, { status: 500 });
  }
}
