import { authController } from '@/lib/controllers/AuthController'

export async function POST() {
  return authController.logout()
}
