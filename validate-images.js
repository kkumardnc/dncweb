const fs = require('fs');
const path = require('path');

console.log('Validating Board Member Images\n');
console.log('='.repeat(50));

// Read the HTML file
const htmlPath = path.join(__dirname, 'about', 'board.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract image sources from HTML
const imgRegex = /<img\s+src="([^"]*board[^"]*)"\s+alt="([^"]*)"/gi;
const matches = [];
let match;

while ((match = imgRegex.exec(html)) !== null) {
    matches.push({
        src: match[1],
        alt: match[2]
    });
}

console.log(`\nFound ${matches.length} board member images in HTML\n`);

// Check if files exist
const results = {
    found: [],
    missing: []
};

matches.forEach((img, index) => {
    const imagePath = path.join(__dirname, img.src);
    const exists = fs.existsSync(imagePath);

    const status = exists ? '✓' : '✗';
    const statusText = exists ? 'EXISTS' : 'MISSING';

    console.log(`${index + 1}. ${status} ${img.alt}`);
    console.log(`   Path: ${img.src}`);
    console.log(`   Full path: ${imagePath}`);
    console.log(`   Status: ${statusText}`);

    if (exists) {
        const stats = fs.statSync(imagePath);
        console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
        results.found.push(img);
    } else {
        results.missing.push(img);
    }

    console.log();
});

// Summary
console.log('='.repeat(50));
console.log('\n📊 SUMMARY\n');
console.log(`✓ Found: ${results.found.length}`);
console.log(`✗ Missing: ${results.missing.length}`);

if (results.missing.length > 0) {
    console.log('\n⚠️  Missing images:');
    results.missing.forEach(img => {
        console.log(`   - ${img.alt}: ${img.src}`);
    });
} else {
    console.log('\n✅ All board member images are present!');
}

// Check for extra files in the board directory
const boardDir = path.join(__dirname, 'assets', 'images', 'board');
const actualFiles = fs.readdirSync(boardDir).filter(f => f.endsWith('.jpg'));
const referencedFiles = matches.map(m => path.basename(m.src));

const extraFiles = actualFiles.filter(f => !referencedFiles.includes(f));

if (extraFiles.length > 0) {
    console.log(`\n📁 Extra files in board directory (not referenced in HTML):`);
    extraFiles.forEach(f => {
        console.log(`   - ${f}`);
    });
}

console.log('\n' + '='.repeat(50));
