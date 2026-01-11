import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTION_DIRS = ['backend', 'frontend', 'prisma'];
const EXCLUDED_DIRS = ['node_modules', '.git', '_development', 'build', 'uploads', 'generated_pdfs'];
const ISSUES = [];

// Scan for potential issues
function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Check for TEST_MODE flags
    if (content.includes('TEST_MODE') || content.includes('testMode')) {
        issues.push(`TEST_MODE flag found`);
    }

    // Check for hard-coded credentials (excluding env variable patterns)
    const credPatterns = [
        /password\s*[:=]\s*["'](?!process\.env|<%|{|\$)[^"']{6,}["']/gi,
        /api[_-]?key\s*[:=]\s*["'](?!process\.env|<%|{|\$)[^"']{10,}["']/gi,
        /secret\s*[:=]\s*["'](?!process\.env|<%|{|\$)[^"']{10,}["']/gi,
    ];
    credPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            issues.push(`Potential hard-coded credential found`);
        }
    });

    // Check for excessive console.log
    const consoleLogs = (content.match(/console\.log/g) || []).length;
    if (consoleLogs > 10) {
        issues.push(`${consoleLogs} console.log statements found (consider using logger)`);
    }

    // Check for debug comments
    const debugComments = content.match(/\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*DEBUG|\/\/\s*HACK/gi);
    if (debugComments && debugComments.length > 3) {
        issues.push(`${debugComments.length} debug comments found`);
    }

    return issues;
}

function scanDirectory(dir, baseDir = dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        // Skip excluded directories
        if (entry.isDirectory()) {
            if (EXCLUDED_DIRS.some(excluded => relativePath.includes(excluded))) {
                continue;
            }
            scanDirectory(fullPath, baseDir);
        } else if (entry.isFile() && entry.name.match(/\.(js|ts|jsx|tsx)$/)) {
            const fileIssues = scanFile(fullPath);
            if (fileIssues.length > 0) {
                ISSUES.push({
                    file: relativePath.replace(/\\/g, '/'),
                    issues: fileIssues
                });
            }
        }
    }
}

function validateStructure(rootDir) {
    console.log('\n📦 Validating production structure...');

    const required = [
        'backend/server.js',
        'backend/config/config.js',
        'frontend/pages/auth/login.html',
        'prisma/schema.prisma',
        'package.json'
    ];

    const missing = [];
    required.forEach(file => {
        if (!fs.existsSync(path.join(rootDir, file))) {
            missing.push(file);
        }
    });

    if (missing.length > 0) {
        console.log('❌ Missing required files:');
        missing.forEach(file => console.log(`   - ${file}`));
        return false;
    }

    console.log('✅ All required production files present');
    return true;
}

function checkEnvironment(rootDir) {
    console.log('\n🔐 Checking environment configuration...');

    const envExample = path.join(rootDir, '.env.example');
    const env = path.join(rootDir, '.env');

    if (!fs.existsSync(envExample)) {
        console.log('⚠️  .env.example not found');
        return false;
    }

    if (!fs.existsSync(env)) {
        console.log('⚠️  .env file not found (required for production)');
        return false;
    }

    console.log('✅ Environment files configured');
    return true;
}

function main() {
    console.log('🔍 Scanning production files for deployment issues...\n');

    const rootDir = path.resolve(__dirname, '..');

    PRODUCTION_DIRS.forEach(dir => {
        const fullPath = path.join(rootDir, dir);
        if (fs.existsSync(fullPath)) {
            console.log(`Scanning ${dir}/...`);
            scanDirectory(fullPath, rootDir);
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log('DEPLOYMENT PREPARATION REPORT');
    console.log('='.repeat(60) + '\n');

    if (ISSUES.length === 0) {
        console.log('✅ No code issues found!\n');
    } else {
        console.log(`⚠️  Found ${ISSUES.length} files with potential issues:\n`);
        ISSUES.forEach(({ file, issues }) => {
            console.log(`📄 ${file}`);
            issues.forEach(issue => console.log(`   - ${issue}`));
            console.log('');
        });
    }

    const structureValid = validateStructure(rootDir);
    const envValid = checkEnvironment(rootDir);

    // List production files
    console.log('\n📋 Production file count:');
    let fileCount = 0;
    PRODUCTION_DIRS.forEach(dir => {
        const fullPath = path.join(rootDir, dir);
        if (fs.existsSync(fullPath)) {
            const count = countFiles(fullPath);
            console.log(`   ${dir}/: ${count} files`);
            fileCount += count;
        }
    });
    console.log(`   Total: ${fileCount} production files\n`);

    const allPassed = ISSUES.length === 0 && structureValid && envValid;

    if (allPassed) {
        console.log('✅ All checks passed! Ready for production deployment.\n');
        process.exit(0);
    } else {
        console.log('⚠️  Please review and fix issues before deployment.\n');
        process.exit(1);
    }
}

function countFiles(dir) {
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(path.resolve(__dirname, '..'), fullPath);

        if (entry.isDirectory()) {
            if (!EXCLUDED_DIRS.some(excluded => relativePath.includes(excluded))) {
                count += countFiles(fullPath);
            }
        } else if (entry.isFile()) {
            count++;
        }
    }
    return count;
}

main();
