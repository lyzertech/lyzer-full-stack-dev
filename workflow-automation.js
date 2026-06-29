#!/usr/bin/env node
/**
 * Lyzer Development Automation Script
 * Generates complete modules following all established patterns and rules
 * 
 * Usage:
 * - Generate new module: node workflow-automation.js --module ModuleName
 * - Generate new page: node workflow-automation.js --page ModuleName FeatureName
 * - Generate backend only: node workflow-automation.js --backend ModuleName ModelName
 * - Generate frontend only: node workflow-automation.js --frontend ModuleName FeatureName
 */

const fs = require('fs');
const path = require('path');

class LyzerWorkflowAutomation {
    constructor() {
        this.templates = {
            frontendPage: '.cursor/templates/lyzer-page-template.tsx',
            laravelController: '.cursor/templates/laravel-controller-template.php',
            laravelModel: '.cursor/templates/laravel-model-template.php',
            laravelRoutes: '.cursor/templates/laravel-routes-template.php'
        };
    }

    /**
     * Generate complete module (backend + frontend)
     */
    generateModule(moduleName, modelName = null, featureName = null) {
        console.log(`🚀 Generating complete ${moduleName} module...`);
        
        const model = modelName || moduleName;
        const feature = featureName || 'dashboard';
        
        // Generate backend
        this.generateBackend(moduleName, model);
        
        // Generate frontend
        this.generateFrontend(moduleName, feature);
        
        // Update module registration
        this.updateModuleServiceProvider(moduleName);
        
        // Generate documentation
        this.generateModuleDocumentation(moduleName, model, feature);
        
        console.log(`✅ ${moduleName} module generated successfully!`);
        this.printNextSteps(moduleName);
    }

    /**
     * Generate backend files (Controller, Model, Routes)
     */
    generateBackend(moduleName, modelName) {
        console.log(`📦 Generating backend for ${moduleName}...`);
        
        const moduleDir = `backend/app/Modules/${moduleName}`;
        const controllersDir = `${moduleDir}/Controllers`;
        const modelsDir = `${moduleDir}/Models`;
        
        // Create directories
        this.ensureDirectoryExists(controllersDir);
        this.ensureDirectoryExists(modelsDir);
        
        // Generate files
        this.generateFromTemplate('laravelController', `${controllersDir}/${modelName}Controller.php`, {
            ModuleName: moduleName,
            ModelName: modelName,
            modelNameLower: this.camelCase(modelName)
        });
        
        this.generateFromTemplate('laravelModel', `${modelsDir}/${modelName}.php`, {
            ModuleName: moduleName,
            ModelName: modelName,
            tableName: this.snakeCase(moduleName) + '_' + this.snakeCase(modelName)
        });
        
        this.generateFromTemplate('laravelRoutes', `${moduleDir}/routes.php`, {
            ModuleName: moduleName,
            ModelName: modelName,
            moduleName: moduleName.toLowerCase(),
            resourceName: this.kebabCase(modelName)
        });
        
        console.log(`✅ Backend generated at ${moduleDir}`);
    }

    /**
     * Generate frontend files (Page, Components)
     */
    generateFrontend(moduleName, featureName) {
        console.log(`🎨 Generating frontend for ${moduleName}/${featureName}...`);
        
        const moduleDir = `frontend/app/(components)/(content-layout)/${moduleName.toLowerCase()}`;
        const featureDir = `${moduleDir}/${this.kebabCase(featureName)}`;
        
        // Create directories
        this.ensureDirectoryExists(featureDir);
        
        // Generate page
        this.generateFromTemplate('frontendPage', `${featureDir}/page.tsx`, {
            ComponentName: this.pascalCase(featureName),
            ModuleName: this.pascalCase(moduleName),
            PageTitle: `${moduleName} - ${featureName}`,
            PageSubtitle: featureName,
            CurrentPage: featureName,
            ActivePage: moduleName,
            CardTitle: `${featureName} Management`
        });
        
        // Generate main component
        const componentContent = this.readTemplate('frontendPage')
            .replace(/export default function/g, `export function ${this.pascalCase(featureName)}View`)
            .replace(/{{ComponentName}}/g, `${this.pascalCase(featureName)}View`);
        
        this.writeFile(`${featureDir}/${this.pascalCase(featureName)}View.tsx`, componentContent);
        
        console.log(`✅ Frontend generated at ${featureDir}`);
    }

    /**
     * Update ModuleServiceProvider to register new module
     */
    updateModuleServiceProvider(moduleName) {
        const providerPath = 'backend/app/Providers/ModuleServiceProvider.php';
        
        if (fs.existsSync(providerPath)) {
            let content = fs.readFileSync(providerPath, 'utf8');
            
            // Add module to $modules array if not exists
            const moduleEntry = `'${moduleName}',`;
            if (!content.includes(moduleEntry)) {
                content = content.replace(
                    /(\$modules\s*=\s*\[[\s\S]*?)\];/,
                    `$1        ${moduleEntry}\n    ];`
                );
                
                this.writeFile(providerPath, content);
                console.log(`✅ Updated ModuleServiceProvider with ${moduleName}`);
            }
        }
    }

    /**
     * Generate module documentation
     */
    generateModuleDocumentation(moduleName, modelName, featureName) {
        const docContent = `# ${moduleName} Module Documentation

## Overview
Auto-generated module following Lyzer project patterns and rules.

## Backend Structure
- **Controller**: \`app/Modules/${moduleName}/Controllers/${modelName}Controller.php\`
- **Model**: \`app/Modules/${moduleName}/Models/${modelName}.php\`
- **Routes**: \`app/Modules/${moduleName}/routes.php\`

## Frontend Structure  
- **Page**: \`app/(components)/(content-layout)/${moduleName.toLowerCase()}/${this.kebabCase(featureName)}/page.tsx\`
- **Component**: \`${this.pascalCase(featureName)}View.tsx\`

## API Endpoints
Base URL: \`${moduleName.toLowerCase()}.lyzer.test/api/${moduleName.toLowerCase()}\`

- \`GET /${this.kebabCase(modelName)}\` - List all
- \`POST /${this.kebabCase(modelName)}\` - Create new
- \`GET /${this.kebabCase(modelName)}/{id}\` - Show specific
- \`PUT /${this.kebabCase(modelName)}/{id}\` - Update specific
- \`DELETE /${this.kebabCase(modelName)}/{id}\` - Delete specific

## Next Steps
1. Run database migrations
2. Update subdomain configuration
3. Add specific validation rules
4. Implement business logic
5. Add tests

Generated on: ${new Date().toISOString()}
`;

        this.writeFile(`frontend/docs/${moduleName.toUpperCase()}_MODULE.md`, docContent);
        console.log(`📚 Documentation generated at frontend/docs/${moduleName.toUpperCase()}_MODULE.md`);
    }

    /**
     * Print next steps after generation
     */
    printNextSteps(moduleName) {
        console.log(`\n📋 NEXT STEPS FOR ${moduleName.toUpperCase()} MODULE:`);
        console.log(`\n🔧 Backend:`);
        console.log(`  1. Create migration: php artisan make:migration create_${this.snakeCase(moduleName)}_table`);
        console.log(`  2. Run migration: php artisan migrate`);
        console.log(`  3. Add validation rules in Controller`);
        
        console.log(`\n🎨 Frontend:`);
        console.log(`  1. Add to sidebar navigation (shared/layouts-components/sidebar/nav.tsx)`);
        console.log(`  2. Configure routing middleware if needed`);
        console.log(`  3. Add API integration`);
        
        console.log(`\n🌐 Configuration:`);
        console.log(`  1. Add ${moduleName.toLowerCase()}.lyzer.test to hosts file`);
        console.log(`  2. Configure Laragon virtual host`);
        console.log(`  3. Test subdomain routing`);
        
        console.log(`\n✅ Module is ready for development!`);
    }

    // Utility methods
    ensureDirectoryExists(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    readTemplate(templateName) {
        const templatePath = this.templates[templateName];
        return fs.readFileSync(templatePath, 'utf8');
    }

    generateFromTemplate(templateName, outputPath, replacements) {
        let content = this.readTemplate(templateName);
        
        for (const [key, value] of Object.entries(replacements)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, value);
        }
        
        this.writeFile(outputPath, content);
    }

    writeFile(filePath, content) {
        const dir = path.dirname(filePath);
        this.ensureDirectoryExists(dir);
        fs.writeFileSync(filePath, content);
    }

    // String transformation utilities
    pascalCase(str) {
        return str.replace(/(?:^|\s|[-_])+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    }

    camelCase(str) {
        const pascal = this.pascalCase(str);
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    }

    kebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    snakeCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }
}

// CLI Interface
const args = process.argv.slice(2);
const automation = new LyzerWorkflowAutomation();

if (args.includes('--module') && args.length >= 2) {
    const moduleName = args[args.indexOf('--module') + 1];
    const modelName = args[args.indexOf('--module') + 2] || moduleName;
    automation.generateModule(moduleName, modelName);
} else if (args.includes('--backend') && args.length >= 3) {
    const moduleName = args[args.indexOf('--backend') + 1];
    const modelName = args[args.indexOf('--backend') + 2];
    automation.generateBackend(moduleName, modelName);
} else if (args.includes('--frontend') && args.length >= 3) {
    const moduleName = args[args.indexOf('--frontend') + 1];
    const featureName = args[args.indexOf('--frontend') + 2];
    automation.generateFrontend(moduleName, featureName);
} else {
    console.log(`
🚀 Lyzer Workflow Automation

Usage:
  node workflow-automation.js --module ModuleName [ModelName]
  node workflow-automation.js --backend ModuleName ModelName  
  node workflow-automation.js --frontend ModuleName FeatureName

Examples:
  node workflow-automation.js --module Inventory Product
  node workflow-automation.js --backend Warehouse Product
  node workflow-automation.js --frontend School Students
`);
}

module.exports = LyzerWorkflowAutomation;