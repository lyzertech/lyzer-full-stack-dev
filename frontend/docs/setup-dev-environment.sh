#!/bin/bash

# Lyzer Full-Stack Development Environment Setup
# Automated setup following all project rules and documentation

set -e  # Exit on any error

echo "🚀 Lyzer Development Environment Setup"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is required but not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm is required but not installed."
        exit 1
    fi
    
    # Check PHP
    if command -v php &> /dev/null; then
        PHP_VERSION=$(php --version | head -n1)
        print_success "PHP found: $PHP_VERSION"
    else
        print_error "PHP is required but not installed. Please install PHP 8.1+ first."
        exit 1
    fi
    
    # Check Composer
    if command -v composer &> /dev/null; then
        COMPOSER_VERSION=$(composer --version | head -n1)
        print_success "Composer found: $COMPOSER_VERSION"
    else
        print_error "Composer is required but not installed."
        exit 1
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git found: $GIT_VERSION"
    else
        print_error "Git is required but not installed."
        exit 1
    fi
}

# Setup backend
setup_backend() {
    print_header "Setting up Laravel Backend"
    
    cd backend
    
    # Install PHP dependencies
    print_info "Installing PHP dependencies..."
    composer install
    print_success "PHP dependencies installed"
    
    # Check for .env file
    if [ ! -f ".env" ]; then
        print_info "Creating .env file from .env.example..."
        cp .env.example .env
        print_success ".env file created"
        
        # Generate app key
        print_info "Generating application key..."
        php artisan key:generate
        print_success "Application key generated"
    else
        print_success ".env file already exists"
    fi
    
    # Run migrations (if database is configured)
    print_info "Running database migrations..."
    if php artisan migrate:status &> /dev/null; then
        php artisan migrate --force
        print_success "Database migrations completed"
    else
        print_warning "Database not configured or not accessible. Please configure database in .env"
    fi
    
    # Seed database (optional)
    read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Seeding database..."
        php artisan db:seed
        print_success "Database seeded"
    fi
    
    cd ..
}

# Setup frontend
setup_frontend() {
    print_header "Setting up Next.js Frontend"
    
    cd frontend
    
    # Install Node dependencies
    print_info "Installing Node.js dependencies..."
    npm install
    print_success "Node.js dependencies installed"
    
    # Build project to check for errors
    print_info "Building project to check for errors..."
    npm run build
    print_success "Project built successfully"
    
    cd ..
}

# Setup Git hooks
setup_git_hooks() {
    print_header "Setting up Git Hooks"
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Lyzer pre-commit hook - ensures code quality

echo "🔍 Running pre-commit checks..."

# Check PHP syntax
echo "Checking PHP syntax..."
find backend -name "*.php" -exec php -l {} \; | grep -v "No syntax errors detected" && exit 1

# Check if Laravel follows modular structure
echo "Checking modular architecture compliance..."
STANDARD_CONTROLLERS=$(find backend/app/Http/Controllers -name "*.php" 2>/dev/null | grep -v "Controller.php" | wc -l)
if [ $STANDARD_CONTROLLERS -gt 0 ]; then
    echo "❌ Found controllers in app/Http/Controllers/. Please move to app/Modules/[ModuleName]/Controllers/"
    find backend/app/Http/Controllers -name "*.php" | grep -v "Controller.php"
    exit 1
fi

STANDARD_MODELS=$(find backend/app/Models -name "*.php" 2>/dev/null | grep -v "User.php" | wc -l)
if [ $STANDARD_MODELS -gt 0 ]; then
    echo "❌ Found models in app/Models/. Please move to app/Modules/[ModuleName]/Models/"
    find backend/app/Models -name "*.php" | grep -v "User.php"
    exit 1
fi

# Check frontend naming conventions
echo "Checking frontend naming conventions..."
WRONG_PAGE_NAMES=$(find frontend/app -name "Page.tsx" -o -name "Layout.tsx" | wc -l)
if [ $WRONG_PAGE_NAMES -gt 0 ]; then
    echo "❌ Found incorrectly named page/layout files. Should be lowercase (page.tsx, layout.tsx)"
    find frontend/app -name "Page.tsx" -o -name "Layout.tsx"
    exit 1
fi

echo "✅ All pre-commit checks passed!"
EOF

    chmod +x .git/hooks/pre-commit
    print_success "Pre-commit hook installed"
    
    # Create commit-msg hook for conventional commits
    cat > .git/hooks/commit-msg << 'EOF'
#!/bin/sh
# Lyzer commit message validation

commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore|build|ci)(\(.+\))?: .{1,50}'

error_msg="❌ Invalid commit message format!

Format: type(scope): description

Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci
Example: feat(auth): add user login functionality"

if ! grep -qE "$commit_regex" "$1"; then
    echo "$error_msg"
    exit 1
fi
EOF

    chmod +x .git/hooks/commit-msg
    print_success "Commit message validation hook installed"
}

# Setup documentation
setup_documentation() {
    print_header "Setting up Documentation"
    
    # Create development guide
    cat > DEVELOPMENT_GUIDE.md << 'EOF'
# Lyzer Development Guide

## 🚀 Quick Start

### Backend Development
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## 📋 Development Commands

### Generate New Module
```bash
cd frontend
npm run generate:module ModuleName ModelName
```

### Generate Backend Only
```bash
npm run generate:backend ModuleName ModelName
```

### Generate Frontend Only
```bash
npm run generate:frontend ModuleName FeatureName
```

## 🛑 Critical Rules

1. **Backend**: Always use modular architecture (`app/Modules/[ModuleName]/`)
2. **Frontend**: Follow naming conventions (kebab-case folders, PascalCase components)
3. **UI**: Follow UI_RULES.md patterns (Seo, Pageheader, Card structure)
4. **Git**: Use conventional commit messages

## 📚 Documentation
- `frontend/docs/UI_RULES.md` - UI patterns and rules
- `frontend/docs/NAMING_CONVENTIONS.md` - File/folder naming
- `.cursorrules` - AI development guidance

## 🔧 Automation
This project includes comprehensive automation:
- Automatic rule checking via .cursorrules
- Code templates for all components
- Pre-commit hooks for quality control
- Automated module generation

Run `npm run lyzer:help` for automation options.
EOF

    print_success "Development guide created"
}

# Setup IDE configuration
setup_ide_config() {
    print_header "Setting up IDE Configuration"
    
    # Create VSCode settings
    mkdir -p .vscode
    
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.workingDirectories": ["frontend"],
  "php.suggest.basic": false,
  "php.validate.executablePath": "php",
  "emmet.includeLanguages": {
    "php": "html"
  },
  "files.associations": {
    "*.tsx": "typescriptreact"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
EOF

    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "bmewburn.vscode-intelephense-client",
    "MehediDracula.php-namespace-resolver",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
EOF

    print_success "IDE configuration created"
}

# Run complete setup
run_complete_setup() {
    print_header "Running Complete Setup"
    
    check_prerequisites
    setup_backend
    setup_frontend
    setup_git_hooks
    setup_documentation
    setup_ide_config
    
    print_header "Setup Complete!"
    print_success "Development environment is ready!"
    
    echo ""
    echo -e "${GREEN}🎉 Next Steps:${NC}"
    echo "1. Configure your database in backend/.env"
    echo "2. Add hosts entries for subdomain testing:"
    echo "   127.0.0.1 lyzer.test finance.lyzer.test labs.lyzer.test school.lyzer.test"
    echo "3. Start development servers:"
    echo "   - Backend: cd backend && php artisan serve"
    echo "   - Frontend: cd frontend && npm run dev"
    echo ""
    echo -e "${BLUE}📖 Documentation:${NC}"
    echo "- Read DEVELOPMENT_GUIDE.md for development workflows"
    echo "- Check frontend/docs/ for project rules and patterns"
    echo "- Use npm run lyzer:help for automation commands"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Main execution
case "${1:-complete}" in
    "backend")
        check_prerequisites
        setup_backend
        ;;
    "frontend")
        check_prerequisites
        setup_frontend
        ;;
    "hooks")
        setup_git_hooks
        ;;
    "docs")
        setup_documentation
        ;;
    "ide")
        setup_ide_config
        ;;
    "complete"|*)
        run_complete_setup
        ;;
esac