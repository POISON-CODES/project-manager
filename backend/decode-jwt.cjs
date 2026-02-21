function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return 'Invalid Token';
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return { header, payload };
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyamhtZWhseGtwbXlyYnRobGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MDQ4OTEsImV4cCI6MjA4Njk4MDg5MX0.Spa_Bp624lBYCHQB3F0zdumaVmpXESryyzdR65Ngn6k";
console.log(JSON.stringify(decodeJWT(token), null, 2));
