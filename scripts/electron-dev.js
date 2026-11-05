const { spawn } = require('node:child_process')

const startUrl = 'http://localhost:5173'
const timeoutMs = 30_000

async function waitForVite() {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    try {
      const response = await fetch(startUrl)
      if (response.ok) return
    } catch {
      // Vite is still starting.
    }

    await new Promise(resolve => setTimeout(resolve, 250))
  }

  throw new Error(`Vite did not start at ${startUrl} within ${timeoutMs / 1000} seconds`)
}

waitForVite()
  .then(() => {
    const electron = spawn(require('electron'), ['.'], {
      stdio: 'inherit',
      env: { ...process.env, ELECTRON_START_URL: startUrl },
    })

    electron.on('error', error => {
      console.error('Failed to start Electron:', error)
      process.exitCode = 1
    })

    electron.on('exit', (code, signal) => {
      if (signal) process.kill(process.pid, signal)
      else process.exitCode = code ?? 1
    })
  })
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
