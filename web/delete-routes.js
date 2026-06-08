const fs = require('fs')
const path = require('path')

const dirsToDelete = [
  path.join(__dirname, 'app/api/db-upgrade'),
  path.join(__dirname, 'app/api/schema-check')
]

dirsToDelete.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
    console.log(`Deleted: ${dir}`)
  } else {
    console.log(`Already deleted: ${dir}`)
  }
})

console.log('Cleanup complete.')
