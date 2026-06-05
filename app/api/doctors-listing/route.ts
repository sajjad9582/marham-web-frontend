import { fetchDoctorsListing } from "@/lib/marham-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const { doctors, meta } = await fetchDoctorsListing({ page });

  return NextResponse.json({ doctors, meta });
}
