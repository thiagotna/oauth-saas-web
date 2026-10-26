import { NextRequest } from 'next/server'
import { resourceController } from '@/lib/controllers/ResourceController'

export async function GET() {
  return resourceController.list()
}

export async function POST(req: NextRequest) {
  return resourceController.create(req)
}
