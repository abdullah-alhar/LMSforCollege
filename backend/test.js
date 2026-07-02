const admin = require("firebase-admin");
const serviceAccount = require("./src/main/resources/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://science-toppers-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();
db.ref("/new/main/content/chem").once("value", (snapshot) => {
  const data = snapshot.val();
  console.log(Object.keys(data || {}));
  process.exit(0);
});
