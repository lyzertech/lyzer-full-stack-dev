import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execPromise = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, value } = body
    
    // Validate parameters
    const addressNum = parseInt(address, 10)
    const valueNum = parseFloat(value)
    
    if (isNaN(addressNum) || isNaN(valueNum)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid address or value parameter' },
        { status: 400 }
      )
    }

    // Path to Python script
    const scriptPath = path.join(process.cwd(), 'lib', 'python', 'modbus_write_conMplus.py')
    
    // Execute Python script
    const { stdout, stderr } = await execPromise(
      `python "${scriptPath}" ${addressNum} ${valueNum}`
    )

    if (stderr) {
      console.error('Python stderr:', stderr)
    }

    // Parse JSON output from Python script
    const result = JSON.parse(stdout)

    if (result.status === 'error') {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      success: true,
      message: 'Write successful',
      value: result.written,
      address: result.address
    })
  } catch (error: any) {
    console.error('Modbus write error:', error)
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to write to Modbus device' },
      { status: 500 }
    )
  }
}
