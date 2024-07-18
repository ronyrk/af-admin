import { NextResponse } from "next/server";


export const GET = async (request: Request) => {
    const url = new URL(request.url);
    const start = url.searchParams.get("from");
    const end = url.searchParams.get("to");
    const page = url.searchParams.get("page");
    const transaction = url.searchParams.get("transaction");
    console.log(request.url);
    return NextResponse.json("ok");
}