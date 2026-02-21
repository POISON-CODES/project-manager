const crypto = require('crypto');

function verifyHS256(token, secret) {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    const data = `${headerB64}.${payloadB64}`;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(data).digest('base64url');

    // Base64url and standard base64 can have different padding/encoding
    // But passport-jwt and supabase use base64url usually.
    return digest === signatureB64;
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyamhtZWhseGtwbXlyYnRobGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MDQ4OTEsImV4cCI6MjA4Njk4MDg5MX0.Spa_Bp624lBYCHQB3F0zdumaVmpXESryyzdR65Ngn6k";
const secret = "frjhmehlxkpmyrbthlch";

console.log('Secret:', secret);
console.log('Verification Result:', verifyHS256(token, secret));
