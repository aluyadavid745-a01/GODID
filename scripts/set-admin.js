const { initializeApp, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const serviceAccount = require('../serviceAccount.json')

initializeApp({ credential: cert(serviceAccount) })

const uid = '59c5nqJdWXO8s8aREqMvuuZTMO72'

getAuth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✓ Admin claim set for user ${uid}`)
    console.log('You can now log in at /admin/login')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error.message)
    process.exit(1)
  })
