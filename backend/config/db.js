const mongoose = require('mongoose');

const maskMongoHost = (uri = '') => {
  try {
    const noProto = String(uri).replace(/^mongodb(\+srv)?:\/\//, '');
    const afterCreds = noProto.includes('@') ? noProto.split('@')[1] : noProto;
    return (afterCreds || '').split('/')[0] || 'unknown';
  } catch {
    return 'unknown';
  }
};

const buildMongooseOptions = () => {
  const parsedFamily = Number(process.env.MONGO_DNS_FAMILY || 4);
  const opts = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 15000,
    retryWrites: true,
    w: 'majority',
    maxPoolSize: 10,
    // Atlas connectivity from WSL/corporate networks is often more stable on IPv4.
    family: Number.isNaN(parsedFamily) ? 4 : parsedFamily,
  };

  if (process.env.MONGO_AUTH_SOURCE) {
    opts.authSource = process.env.MONGO_AUTH_SOURCE;
  }

  return opts;
};

const normalizeMongoUri = (value) => {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const getFailureHint = (message = '') => {
  const m = String(message).toLowerCase();
  if (m.includes('querysrv') || m.includes('enotfound')) {
    return 'DNS/SRV lookup failed. Try MONGO_URI_FALLBACK with a standard mongodb:// URI from Compass.';
  }
  if (m.includes('whitelist') || m.includes('not authorized') || m.includes('authentication failed')) {
    return 'Check Atlas Network Access (IP allowlist) and DB user credentials/password encoding.';
  }
  if (m.includes('ssl') || m.includes('tls')) {
    return 'TLS handshake failed. Verify cluster TLS settings and connection string options.';
  }
  if (m.includes('could not connect to any servers') || m.includes('server selection')) {
    return 'Atlas hosts are unreachable from this runtime. Verify outbound network/VPN/firewall and cluster status.';
  }
  return 'Check Mongo URI, Atlas cluster status, and network reachability.';
};

const connectWithUri = async (uri, options, label) => {
  const conn = await mongoose.connect(uri, options);
  console.log(`✅ MongoDB Connected (${label}): ${conn.connection.host}`);
  return true;
};

const connectDB = async () => {
  const primaryUri = normalizeMongoUri(process.env.MONGO_URI);
  const fallbackUri = normalizeMongoUri(process.env.MONGO_URI_FALLBACK);
  const options = buildMongooseOptions();

  if (!primaryUri) {
    console.error('⚠️  MONGO_URI is not set.');
    console.log('ℹ️  Server will start without MongoDB. Database features will not work.');
    return false;
  }

  try {
    await connectWithUri(primaryUri, options, 'primary');
    return true;
  } catch (err) {
    console.error(`⚠️  MongoDB primary connection failed [${maskMongoHost(primaryUri)}]: ${err.message}`);

    if (fallbackUri && fallbackUri !== primaryUri) {
      try {
        console.warn(`ℹ️  Retrying MongoDB with MONGO_URI_FALLBACK [${maskMongoHost(fallbackUri)}]...`);
        await connectWithUri(fallbackUri, options, 'fallback');
        return true;
      } catch (fallbackErr) {
        console.error(`⚠️  MongoDB fallback connection failed [${maskMongoHost(fallbackUri)}]: ${fallbackErr.message}`);
      }
    }

    console.error(`🔎 MongoDB hint: ${getFailureHint(err?.message)}`);
    console.error(`🔎 MongoDB context: primary=${maskMongoHost(primaryUri)} fallback=${fallbackUri ? maskMongoHost(fallbackUri) : 'none'} family=${options.family}`);
    console.log('ℹ️  Server will start without MongoDB. Database features will not work.');
    return false;
  }
};

module.exports = connectDB;
