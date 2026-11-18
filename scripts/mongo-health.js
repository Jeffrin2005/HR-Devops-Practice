const admin = db.getSiblingDB('admin');
if (!admin.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD)) quit(1);
try {
  const status = rs.status();
  quit(status.myState === 1 ? 0 : 1);
} catch (error) {
  if (error.code !== 94) throw error;
  rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: process.env.MONGO_REPLICA_HOST || 'database:27017' }] });
  quit(1);
}
