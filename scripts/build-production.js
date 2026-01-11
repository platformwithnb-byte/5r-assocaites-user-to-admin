import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(SOURCE_DIR, 'build');

const INCLUDED_ITEMS = [
    'backend',
    'frontend',
    'prisma',
    'scripts',
    'package.json',
    '.env.example',
    'README.md',
    'IMPLEMENTATION_COMPLETE.md'
];

const EXCLUDED_PATTERNS = [
    '_development',
    'node_modules',
    '.git',
    'build',
    '.env',
    '*.log',
    'temp',
    'uploads',
    'generated_pdfs',
    'database',
    '.vscode',
    '.idea',
    'test-',
    'debug-',
    '*.tmp',
    '*.bak'
];

function shouldExclude(itemPath) {
    const relativePath = path.relative(SOURCE_DIR, itemPath).replace(/\\/g, '/');
    return EXCLUDED_PATTERNS.some(pattern => {
        if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(relativePath);
        }
        return relativePath.includes(pattern);
    });
}

function copyWithFilter(src, dest) {
    return fs.copy(src, dest, {
        filter: (srcPath) => {
            const shouldInclude = !shouldExclude(srcPath);
            if (!shouldInclude) {
                const relativePath = path.relative(SOURCE_DIR, srcPath);
                console.log(`   ⏭️  Skipping: ${relativePath}`);
            }
            return shouldInclude;
        }
    });
}

async function main() {
    console.log('🏗️  Building production package...\n');

    // Clean build directory
    if (fs.existsSync(BUILD_DIR)) {
        console.log('🗑️  Cleaning existing build directory...');
        await fs.remove(BUILD_DIR);
    }

    // Create build directory
    await fs.ensureDir(BUILD_DIR);
    console.log('📁 Created build directory\n');

    // Copy production files
    console.log('📦 Copying production files...\n');

    for (const item of INCLUDED_ITEMS) {
        const srcPath = path.join(SOURCE_DIR, item);
        const destPath = path.join(BUILD_DIR, item);

        if (fs.existsSync(srcPath)) {
            console.log(`📋 Copying ${item}...`);
            await copyWithFilter(srcPath, destPath);
        } else {
            console.log(`⚠️  ${item} not found, skipping`);
        }
    }

    // Create necessary directories in build
    console.log('\n📁 Creating required runtime directories...');
    const requiredDirs = [
        'backend/uploads',
        'backend/public/uploads',
        'uploads/progress',
        'generated_pdfs',
        'database'
    ];

    for (const dir of requiredDirs) {
        const dirPath = path.join(BUILD_DIR, dir);
        await fs.ensureDir(dirPath);
        // Create .gitkeep
        await fs.writeFile(path.join(dirPath, '.gitkeep'), '');
        console.log(`   ✅ ${dir}`);
    }

    // Copy .env.example as .env template
    console.log('\n📄 Creating environment template...');
    await fs.copy(
        path.join(SOURCE_DIR, '.env.example'),
        path.join(BUILD_DIR, '.env.template')
    );
    console.log('   ✅ Created .env.template');

    // Generate build info
    const packageJson = await fs.readJSON(path.join(SOURCE_DIR, 'package.json'));
    const buildInfo = {
        buildDate: new Date().toISOString(),
        version: packageJson.version,
        nodeVersion: process.version,
        excludedPatterns: EXCLUDED_PATTERNS,
        includedItems: INCLUDED_ITEMS
    };

    await fs.writeJSON(
        path.join(BUILD_DIR, 'build-info.json'),
        buildInfo,
        { spaces: 2 }
    );

    // Create deployment instructions
    const deployInstructions = `# Production Deployment Instructions

## Build Information
- Build Date: ${buildInfo.buildDate}
- Version: ${buildInfo.version}
- Node Version: ${buildInfo.nodeVersion}

## Pre-Deployment Checklist

1. **Environment Configuration**
   - Copy .env.template to .env
   - Fill in all required environment variables
   - Ensure DATABASE_URL points to production database
   - Set JWT_SECRET to a secure random string
   - Configure Razorpay keys (if using payment gateway)
   - Set SENDGRID_API_KEY for email notifications

2. **Database Setup**
   - Run: \`npx prisma generate\`
   - Run: \`npx prisma migrate deploy\`
   - Verify database connection

3. **Dependencies**
   - Run: \`npm install --production\`
   - Verify all dependencies installed

4. **Security**
   - Ensure .env is NOT committed to version control
   - Verify file permissions on uploads directory
   - Check that _development folder is NOT deployed

5. **Testing**
   - Start server: \`npm start\`
   - Test health endpoint: http://your-domain/health
   - Verify login functionality
   - Test file upload functionality

## Directory Structure

- backend/          Server-side code
- frontend/         Client-side code
- prisma/          Database schema and migrations
- scripts/         Utility scripts
- uploads/         Runtime file uploads (empty on deploy)
- generated_pdfs/  Generated PDF storage (empty on deploy)

## Important Notes

⚠️ **DO NOT copy these from development:**
- _development/ folder
- node_modules/ (reinstall with npm install)
- .env file (create new with production values)
- uploads/ contents (regenerated at runtime)
- database/ folder

## Support

For issues, refer to:
- README.md for general information
- IMPLEMENTATION_COMPLETE.md for feature documentation
`;

    await fs.writeFile(
        path.join(BUILD_DIR, 'DEPLOY.md'),
        deployInstructions
    );

    console.log('\n' + '='.repeat(60));
    console.log('✅ Production build complete!');
    console.log('='.repeat(60));
    console.log(`\n📦 Build location: ${BUILD_DIR}`);
    console.log(`📅 Build date: ${buildInfo.buildDate}`);
    console.log(`\n⚠️  Next steps:`);
    console.log(`   1. Review DEPLOY.md in build/ folder`);
    console.log(`   2. Copy .env.template to .env and configure`);
    console.log(`   3. Run 'npm install --production' in build/`);
    console.log(`   4. Set up database with Prisma migrations`);
    console.log(`   5. Test the deployment locally before uploading\n`);
}

main().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
