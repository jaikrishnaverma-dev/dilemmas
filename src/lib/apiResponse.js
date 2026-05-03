import { NextResponse } from 'next/server';

/**
 * Unified API response envelope.
 * Every API returns: { status, data, message }
 */
export function successResponse(data = null, message = 'Success', statusCode = 200) {
  return NextResponse.json(
    { status: 'success', data, message },
    { status: statusCode }
  );
}

export function errorResponse(message = 'Something went wrong', statusCode = 400, errors = null) {
  const body = { status: 'error', data: null, message };
  if (errors) body.errors = errors;
  return NextResponse.json(body, { status: statusCode });
}
