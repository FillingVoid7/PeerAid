import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { SearchService } from "@/lib/Services/searchService";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const conditionCategory = searchParams.get("conditionCategory") || undefined;
    const conditionName = searchParams.get("conditionName") || undefined;
    const symptomsParam = searchParams.get("symptoms");
    const symptoms = symptomsParam ? symptomsParam.split(",").map(s => s.trim()).filter(Boolean) : undefined;
    const ageMin = searchParams.get("ageMin");
    const ageMax = searchParams.get("ageMax");
    const gender = searchParams.get("gender") || undefined;
    const location = searchParams.get("location") || undefined;
    const verificationStatus = searchParams.get("verificationStatus") || undefined;
    const minHelpfulCountStr = searchParams.get("minHelpfulCount");
    const limitStr = searchParams.get("limit");
    const pageStr = searchParams.get("page");
    const forRole = (searchParams.get("forRole") as "seeker" | "guide") || "seeker";

    const filters: any = {
      conditionCategory,
      conditionName,
      symptoms,
      gender,
      location,
      verificationStatus,
    };

    if (ageMin || ageMax) {
      filters.ageRange = {
        min: ageMin ? parseInt(ageMin, 10) : 0,
        max: ageMax ? parseInt(ageMax, 10) : 120,
      };
    }

    if (minHelpfulCountStr) {
      filters.minHelpfulCount = parseInt(minHelpfulCountStr, 10);
    }
    if (limitStr) filters.limit = parseInt(limitStr, 10);
    if (pageStr) filters.page = parseInt(pageStr, 10);

    const searchService = new SearchService();
    const results = await searchService.searchProfiles(filters, forRole);

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("GET /api/search error", error);
    return NextResponse.json({ message: "Search failed" }, { status: 500 });
  }
}


