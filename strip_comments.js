const fs = require('fs');
const path = require('path');

const filesToStrip = [
    'frontend/src/pages/admin/AdminComplaints.jsx',
    'frontend/src/pages/admin/AdminDashboard.jsx',
    'frontend/src/pages/admin/AdminAssets.jsx',
    'frontend/src/pages/shared/Reports.jsx',
    'frontend/src/pages/shared/Payments.jsx',
    'frontend/src/pages/technician/TechnicianDashboard.jsx',
    'frontend/src/pages/user/SubmitTicket.jsx',
    'backend/src/main/java/com/itsm/config/SecurityConfig.java'
];

filesToStrip.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Remove single line JS comments (// ...) but carefully avoiding inner string //
        // A safer regex for single line comments only at the start of lines or preceded by whitespace:
        content = content.replace(/^\s*\/\/.*$/gm, '');

        // Remove JSX comments {/* ... */}
        content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

        // Remove multi-line JS/Java comments /* ... */
        content = content.replace(/\/\*[\s\S]*?\*\//g, '');

        // Remove excessive blank lines left over by comments removal
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Stripped comments from: ' + filePath);
    }
});
