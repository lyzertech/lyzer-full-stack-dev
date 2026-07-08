#!/usr/bin/env node
/**
 * 🤖 Lyzer Master Automation Launcher
 * Unified command-line interface for all development automation
 * 
 * Usage: node lyzer-automation.js <command> [options]
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class LyzerAutomation {
    constructor() {
        this.version = '1.0.0';
        this.commands = {
            // Generation commands
            'generate': {
                description: 'Generate code components',
                subcommands: {
                    'module': 'Generate complete module (backend + frontend)',
                    'backend': 'Generate backend components only',
                    'frontend': 'Generate frontend components only',
                    'migration': 'Generate database migration',
                    'test': 'Generate test files'
                }
            },
            // Development commands
            'dev': {
                description: 'Development environment commands',
                subcommands: {
                    'setup': 'Setup development environment',
                    'start': 'Start development servers',
                    'test': 'Run all tests',
                    'lint': 'Run code linting',
                    'format': 'Format code'
                }
            },
            // Quality commands
            'quality': {
                description: 'Code quality and compliance',
                subcommands: {
                    'check': 'Run all quality checks',
                    'architecture': 'Check architecture compliance',
                    'security': 'Run security scans',
                    'performance': 'Run performance tests'
                }
            },
            // Documentation commands
            'docs': {
                description: 'Documentation management',
                subcommands: {
                    'generate': 'Generate documentation',
                    'serve': 'Serve documentation locally',
                    'update': 'Update documentation'
                }
            },
            // Deployment commands
            'deploy': {
                description: 'Deployment automation',
                subcommands: {
                    'staging': 'Deploy to staging',
                    'production': 'Deploy to production',
                    'rollback': 'Rollback deployment'
                }
            },
            // Utility commands
            'utils': {
                description: 'Utility functions',
                subcommands: {
                    'clean': 'Clean build artifacts',
                    'backup': 'Backup project data',
                    'analyze': 'Analyze project metrics',
                    'optimize': 'Optimize project performance'
                }
            }
        };
    }

    // Main command dispatcher
    async run(args) {
        const [command, subcommand, ...options] = args;

        try {
            switch (command) {
                case 'generate':
                    await this.handleGenerate(subcommand, options);
                    break;
                case 'dev':
                    await this.handleDev(subcommand, options);
                    break;
                case 'quality':
                    await this.handleQuality(subcommand, options);
                    break;
                case 'docs':
                    await this.handleDocs(subcommand, options);
                    break;
                case 'deploy':
                    await this.handleDeploy(subcommand, options);
                    break;
                case 'utils':
                    await this.handleUtils(subcommand, options);
                    break;
                case 'help':
                case '--help':
                case '-h':
                    this.showHelp(subcommand);
                    break;
                case 'version':
                case '--version':
                case '-v':
                    this.showVersion();
                    break;
                default:
                    if (!command) {
                        this.showWelcome();
                    } else {
                        console.error(`❌ Unknown command: ${command}`);
                        this.showHelp();
                    }
            }
        } catch (error) {
            console.error(`❌ Error executing command: ${error.message}`);
            process.exit(1);
        }
    }

    // Generate command handler
    async handleGenerate(subcommand, options) {
        this.printHeader('🏗️ Code Generation');

        switch (subcommand) {
            case 'module':
                await this.generateModule(options);
                break;
            case 'backend':
                await this.generateBackend(options);
                break;
            case 'frontend':
                await this.generateFrontend(options);
                break;
            case 'migration':
                await this.generateMigration(options);
                break;
            case 'test':
                await this.generateTest(options);
                break;
            default:
                console.log('📋 Available generation options:');
                this.listSubcommands('generate');
        }
    }

    // Development command handler
    async handleDev(subcommand, options) {
        this.printHeader('⚡ Development Commands');

        switch (subcommand) {
            case 'setup':
                await this.devSetup(options);
                break;
            case 'start':
                await this.devStart(options);
                break;
            case 'test':
                await this.devTest(options);
                break;
            case 'lint':
                await this.devLint(options);
                break;
            case 'format':
                await this.devFormat(options);
                break;
            default:
                console.log('📋 Available development options:');
                this.listSubcommands('dev');
        }
    }

    // Quality command handler
    async handleQuality(subcommand, options) {
        this.printHeader('🔍 Quality Assurance');

        switch (subcommand) {
            case 'check':
                await this.qualityCheckAll(options);
                break;
            case 'architecture':
                await this.qualityArchitecture(options);
                break;
            case 'security':
                await this.qualitySecurity(options);
                break;
            case 'performance':
                await this.qualityPerformance(options);
                break;
            default:
                console.log('📋 Available quality options:');
                this.listSubcommands('quality');
        }
    }

    // Documentation command handler
    async handleDocs(subcommand, options) {
        this.printHeader('📚 Documentation');

        switch (subcommand) {
            case 'generate':
                await this.docsGenerate(options);
                break;
            case 'serve':
                await this.docsServe(options);
                break;
            case 'update':
                await this.docsUpdate(options);
                break;
            default:
                console.log('📋 Available documentation options:');
                this.listSubcommands('docs');
        }
    }

    // Deployment command handler
    async handleDeploy(subcommand, options) {
        this.printHeader('🚀 Deployment');

        switch (subcommand) {
            case 'staging':
                await this.deployStaging(options);
                break;
            case 'production':
                await this.deployProduction(options);
                break;
            case 'rollback':
                await this.deployRollback(options);
                break;
            default:
                console.log('📋 Available deployment options:');
                this.listSubcommands('deploy');
        }
    }

    // Utils command handler
    async handleUtils(subcommand, options) {
        this.printHeader('🔧 Utilities');

        switch (subcommand) {
            case 'clean':
                await this.utilsClean(options);
                break;
            case 'backup':
                await this.utilsBackup(options);
                break;
            case 'analyze':
                await this.utilsAnalyze(options);
                break;
            case 'optimize':
                await this.utilsOptimize(options);
                break;
            default:
                console.log('📋 Available utility options:');
                this.listSubcommands('utils');
        }
    }

    // Implementation methods
    async generateModule(options) {
        const [moduleName, modelName] = options;
        if (!moduleName) {
            console.error('❌ Module name required: lyzer generate module <ModuleName> [ModelName]');
            return;
        }

        console.log(`🏗️ Generating module: ${moduleName}`);
        await this.executeCommand('node', ['workflow-automation.js', '--module', moduleName, modelName || moduleName]);
        console.log('✅ Module generation completed!');
    }

    async generateBackend(options) {
        const [moduleName, modelName] = options;
        if (!moduleName || !modelName) {
            console.error('❌ Module and model names required: lyzer generate backend <ModuleName> <ModelName>');
            return;
        }

        console.log(`🏗️ Generating backend: ${moduleName}/${modelName}`);
        await this.executeCommand('node', ['workflow-automation.js', '--backend', moduleName, modelName]);
        console.log('✅ Backend generation completed!');
    }

    async generateFrontend(options) {
        const [moduleName, featureName] = options;
        if (!moduleName || !featureName) {
            console.error('❌ Module and feature names required: lyzer generate frontend <ModuleName> <FeatureName>');
            return;
        }

        console.log(`🎨 Generating frontend: ${moduleName}/${featureName}`);
        await this.executeCommand('node', ['workflow-automation.js', '--frontend', moduleName, featureName]);
        console.log('✅ Frontend generation completed!');
    }

    async devSetup(options) {
        console.log('⚡ Setting up development environment...');
        await this.executeCommand('bash', ['setup-dev-environment.sh']);
        console.log('✅ Development environment setup completed!');
    }

    async devStart(options) {
        console.log('🚀 Starting development servers...');
        
        // Start backend server
        const backendProcess = spawn('php', ['artisan', 'serve'], { 
            cwd: 'backend',
            stdio: 'inherit' 
        });
        
        // Start frontend server
        const frontendProcess = spawn('npm', ['run', 'dev'], { 
            cwd: 'frontend',
            stdio: 'inherit' 
        });

        console.log('✅ Development servers started!');
        console.log('🔗 Backend: http://localhost:8000');
        console.log('🔗 Frontend: http://localhost:3000');

        // Handle process cleanup
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down servers...');
            backendProcess.kill();
            frontendProcess.kill();
            process.exit();
        });
    }

    async devTest(options) {
        console.log('🧪 Running all tests...');
        
        // Run backend tests
        console.log('🐘 Running backend tests...');
        await this.executeCommand('vendor/bin/phpunit', [], { cwd: 'backend' });
        
        // Run frontend tests
        console.log('🎨 Running frontend tests...');
        await this.executeCommand('npm', ['test'], { cwd: 'frontend' });
        
        console.log('✅ All tests completed!');
    }

    async qualityCheckAll(options) {
        console.log('🔍 Running comprehensive quality checks...');
        
        await this.qualityArchitecture(options);
        await this.qualitySecurity(options);
        await this.devLint(options);
        
        console.log('✅ All quality checks completed!');
    }

    async qualityArchitecture(options) {
        console.log('🏗️ Checking architecture compliance...');
        
        // Check backend modular structure
        const wrongControllers = await this.findFiles('backend/app/Http/Controllers', '*.php', ['Controller.php']);
        const wrongModels = await this.findFiles('backend/app/Models', '*.php', ['User.php']);
        
        if (wrongControllers.length > 0) {
            console.error('❌ Controllers found in wrong location:');
            wrongControllers.forEach(file => console.error(`   ${file}`));
        }
        
        if (wrongModels.length > 0) {
            console.error('❌ Models found in wrong location:');
            wrongModels.forEach(file => console.error(`   ${file}`));
        }
        
        if (wrongControllers.length === 0 && wrongModels.length === 0) {
            console.log('✅ Architecture compliance check passed!');
        }
    }

    async utilsClean(options) {
        console.log('🧹 Cleaning build artifacts...');
        
        const cleanPaths = [
            'frontend/.next',
            'frontend/node_modules/.cache',
            'backend/vendor/cache',
            'backend/bootstrap/cache/*.php'
        ];
        
        for (const cleanPath of cleanPaths) {
            if (fs.existsSync(cleanPath)) {
                await this.executeCommand('rm', ['-rf', cleanPath]);
                console.log(`  ✅ Cleaned ${cleanPath}`);
            }
        }
        
        console.log('✅ Cleanup completed!');
    }

    // Utility methods
    async executeCommand(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                stdio: 'inherit',
                shell: true,
                ...options
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command failed with exit code ${code}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    async findFiles(directory, pattern, exclude = []) {
        try {
            const { stdout } = await execAsync(`find ${directory} -name "${pattern}" 2>/dev/null || true`);
            return stdout.split('\n').filter(file => 
                file.trim() && !exclude.some(exc => file.includes(exc))
            );
        } catch (error) {
            return [];
        }
    }

    // Display methods
    showWelcome() {
        console.log(`
🤖 Lyzer Master Automation v${this.version}

Unified command-line interface for all development automation.

Usage:
  lyzer <command> <subcommand> [options]

Commands:
  generate    Generate code components (modules, controllers, etc.)
  dev         Development environment management
  quality     Code quality and compliance checking
  docs        Documentation generation and management
  deploy      Deployment automation
  utils       Utility functions and helpers

Examples:
  lyzer generate module Inventory Product
  lyzer dev setup
  lyzer quality check
  lyzer deploy staging

For detailed help: lyzer help <command>
        `);
    }

    showHelp(command) {
        if (command && this.commands[command]) {
            console.log(`\n📖 Help for '${command}' command:`);
            console.log(`Description: ${this.commands[command].description}\n`);
            this.listSubcommands(command);
        } else {
            this.showWelcome();
        }
    }

    showVersion() {
        console.log(`Lyzer Automation v${this.version}`);
    }

    listSubcommands(command) {
        if (this.commands[command] && this.commands[command].subcommands) {
            Object.entries(this.commands[command].subcommands).forEach(([sub, desc]) => {
                console.log(`  ${sub.padEnd(15)} ${desc}`);
            });
        }
        console.log();
    }

    printHeader(title) {
        console.log(`\n${title}`);
        console.log('='.repeat(title.length));
    }
}

// CLI Entry point
const args = process.argv.slice(2);
const automation = new LyzerAutomation();
automation.run(args).catch(error => {
    console.error(`💥 Fatal error: ${error.message}`);
    process.exit(1);
});

module.exports = LyzerAutomation;