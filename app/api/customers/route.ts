import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

const handler = withAuth(async (request: NextRequest, { userId }) => {
  if (request.method === "GET") {
    const customers = await prisma.customer.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(customers);
  }

  if (request.method === "POST") {
    const body = await request.json();
    const customer = await prisma.customer.create({
      data: {
        userId,
        name: body.name,
        type: body.type,
        sparte: body.sparte,
        stage: body.stage || 0,
        expectedCourtage: body.expectedCourtage || 0,
        nextStep: body.nextStep,
        phone: body.phone,
        email: body.email,
        source: body.source,
      },
    });
    return NextResponse.json(customer, { status: 201 });
  }

  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
});

export const GET = handler;
export const POST = handler;
