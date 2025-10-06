import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectDB from "@/lib/db";
import { SearchService, SearchFilters } from "@/lib/Services/searchService";

interface SearchParams {
  // Basic search
  conditionCategory?: string;
  conditionName?: string;
  symptoms?: string;
  
  // Medical filters
  symptomSeverity?: 'mild' | 'moderate' | 'severe';
  treatmentTypes?: string;
  diagnosedOnly?: string;
  conditionDuration?: 'recent' | 'chronic' | 'resolved';
  
  // Demographics
  ageMin?: string;
  ageMax?: string;
  gender?: string;
  location?: string;
  
  // Quality filters
  verificationStatus?: 'any' | 'verified' | 'not-verified';
  verificationMethod?: 'medical_document' | 'community-validated' | 'self-declared';
  minHelpfulCount?: string;
  minMatchScore?: string;
  
  // Sorting & pagination
  sortBy?: 'relevance' | 'helpfulCount' | 'matchCount' | 'verification' | 'recent';
  sortOrder?: 'asc' | 'desc';
  limit?: string;
  page?: string;
  
  // User context
  forRole?: 'seeker' | 'guide';
  currentUserId?: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const params = extractSearchParams(searchParams);
    const filters = buildSearchFilters(params);
    
    const userRole = params.forRole || 'seeker';
    const currentUserId = params.currentUserId ? new Types.ObjectId(params.currentUserId) : undefined;
    
    const searchService = new SearchService();
    const results = await searchService.searchProfiles(filters, userRole, currentUserId);

    return NextResponse.json({
      success: true,
      data: results
    }, { status: 200 });

  } catch (error) {
    console.error("Search API error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Search operation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}


function extractSearchParams(searchParams: URLSearchParams): SearchParams {
  return {
    // Basic search
    conditionCategory: searchParams.get("conditionCategory") || undefined,
    conditionName: searchParams.get("conditionName") || undefined,
    symptoms: searchParams.get("symptoms") || undefined,
    
    // Medical filters
    symptomSeverity: searchParams.get("symptomSeverity") as 'mild' | 'moderate' | 'severe' || undefined,
    treatmentTypes: searchParams.get("treatmentTypes") || undefined,
    diagnosedOnly: searchParams.get("diagnosedOnly") || undefined,
    conditionDuration: searchParams.get("conditionDuration") as 'recent' | 'chronic' | 'resolved' || undefined,
    
    // Demographics
    ageMin: searchParams.get("ageMin") || undefined,
    ageMax: searchParams.get("ageMax") || undefined,
    gender: searchParams.get("gender") || undefined,
    location: searchParams.get("location") || undefined,
    
    // Quality filters
    verificationStatus: searchParams.get("verificationStatus") as 'any' | 'verified' | 'not-verified' || undefined,
    verificationMethod: searchParams.get("verificationMethod") as 'medical_document' | 'community-validated' | 'self-declared' || undefined,
    minHelpfulCount: searchParams.get("minHelpfulCount") || undefined,
    minMatchScore: searchParams.get("minMatchScore") || undefined,
    
    // Sorting & pagination
    sortBy: searchParams.get("sortBy") as 'relevance' | 'helpfulCount' | 'matchCount' | 'verification' | 'recent' || undefined,
    sortOrder: searchParams.get("sortOrder") as 'asc' | 'desc' || undefined,
    limit: searchParams.get("limit") || undefined,
    page: searchParams.get("page") || undefined,
    
    // User context
    forRole: searchParams.get("forRole") as 'seeker' | 'guide' || undefined,
    currentUserId: searchParams.get("currentUserId") || undefined,
  };
}


function buildSearchFilters(params: SearchParams): SearchFilters {
  const filters: SearchFilters = {};

  // Basic search filters
  if (params.conditionCategory) filters.conditionCategory = params.conditionCategory;
  if (params.conditionName) filters.conditionName = params.conditionName;
  if (params.symptoms) {
    filters.symptoms = params.symptoms.split(",").map(s => s.trim()).filter(Boolean);
  }

  // Medical filters
  if (params.symptomSeverity) filters.symptomSeverity = params.symptomSeverity;
  if (params.treatmentTypes) {
    filters.treatmentTypes = params.treatmentTypes.split(",").map(t => t.trim()).filter(Boolean);
  }
  if (params.diagnosedOnly) filters.diagnosedOnly = params.diagnosedOnly === 'true';
  if (params.conditionDuration) filters.conditionDuration = params.conditionDuration;

  // Demographic filters
  if (params.ageMin || params.ageMax) {
    filters.ageRange = {
      min: params.ageMin ? Math.max(0, parseInt(params.ageMin, 10)) : 0,
      max: params.ageMax ? Math.min(120, parseInt(params.ageMax, 10)) : 120,
    };
  }
  if (params.gender) filters.gender = params.gender;
  if (params.location) filters.location = params.location;

  // Quality filters
  if (params.verificationStatus) filters.verificationStatus = params.verificationStatus;
  if (params.verificationMethod) filters.verificationMethod = params.verificationMethod;
  if (params.minHelpfulCount) {
    const count = parseInt(params.minHelpfulCount, 10);
    if (!isNaN(count) && count >= 0) filters.minHelpfulCount = count;
  }
  if (params.minMatchScore) {
    const score = parseFloat(params.minMatchScore);
    if (!isNaN(score) && score >= 0 && score <= 1) filters.minMatchScore = score;
  }

  // Sorting & pagination
  if (params.sortBy) filters.sortBy = params.sortBy;
  if (params.sortOrder) filters.sortOrder = params.sortOrder;
  if (params.limit) {
    const limit = parseInt(params.limit, 10);
    if (!isNaN(limit) && limit > 0 && limit <= 100) filters.limit = limit;
  }
  if (params.page) {
    const page = parseInt(params.page, 10);
    if (!isNaN(page) && page > 0) filters.page = page;
  }

  return filters;
}


