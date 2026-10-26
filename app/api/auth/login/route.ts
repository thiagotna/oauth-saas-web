import { NextRequest } from 'next/server'
import { authController } from '@/lib/controllers/AuthController'

export async function POST(req: NextRequest) {
  return authController.login(req)
}
