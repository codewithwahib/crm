import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing work order ID" },
      { status: 400 }
    );
  }

  try {
    // ✅ Expand file references with -> to fetch URLs
    const query = `
      *[_type == "workOrderSalesOrder" && _id == $id][0]{
        ...,
        salesOrderSection {
          ...,
          requiredDocuments {
            quotationWithFinalPrice {
              _type,
              asset->{
                _id,
                url
              }
            },
            approvedShopDrawing {
              _type,
              asset->{
                _id,
                url
              }
            },
            componentList {
              _type,
              asset->{
                _id,
                url
              }
            },
            customerPOCopy {
              _type,
              asset->{
                _id,
                url
              }
            },
            technicalSpecifications {
              _type,
              asset->{
                _id,
                url
              }
            }
          }
        }
      }
    `;

    const result = await client.fetch(query, { id });

    if (!result) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("GET work order error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: "Failed to fetch work order" },
      { status: 500 }
    );
  }
}