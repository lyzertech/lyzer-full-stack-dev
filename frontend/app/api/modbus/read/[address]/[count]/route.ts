import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execPromise = promisify(exec)

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string; count: string } }
) {
  try {
    const { address, count } = params
    
    // Validate parameters
    const addressNum = parseInt(address, 10)
    const countNum = parseInt(count, 10)
    
    if (isNaN(addressNum) || isNaN(countNum)) {
      return NextResponse.json(
        { error: 'Invalid address or count parameter' },
        { status: 400 }
      )
    }

    // Path to Python script
    const scriptPath = path.join(process.cwd(), 'lib', 'python', 'modbus_read_conMplus.py')
    
    // Execute Python script
    const { stdout, stderr } = await execPromise(
      `python "${scriptPath}" ${addressNum} ${countNum}`
    )

    if (stderr) {
      console.error('Python stderr:', stderr)
    }

    // Parse JSON output from Python script
    const result = JSON.parse(stdout)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Modbus read error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to read from Modbus device' },
      { status: 500 }
    )
  }
}
