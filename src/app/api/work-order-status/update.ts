import { client } from '@/sanity/lib/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { id, status } = req.body

    if (!id || !status) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Update the status in Sanity
    const updatedWorkOrder = await client
      .patch(id)
      .set({
        'workOrderSection.status.currentStatus': status,
        'workOrderSection.status.statusHistory': [
          {
            _key: `statusUpdate-${Date.now()}`,
            status: status,
            date: new Date().toISOString(),
            notes: `Status changed to ${status}`
          }
        ]
      })
      .commit()

    return res.status(200).json(updatedWorkOrder)
  } catch (error) {
    console.error('Error updating work order status:', error)
    return res.status(500).json({ message: 'Error updating work order status' })
  }
}