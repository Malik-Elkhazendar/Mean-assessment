#!/bin/bash

# E2E Test Runner Script
# This script sets up the testing environment and runs E2E tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting E2E Test Runner${NC}"

# Check if MongoDB is running
echo -e "${YELLOW}📊 Checking MongoDB connection...${NC}"
if ! mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null; then
    echo -e "${RED}❌ MongoDB is not running. Please start MongoDB first.${NC}"
    echo -e "${YELLOW}💡 To start MongoDB:${NC}"
    echo -e "   • macOS (brew): ${BLUE}brew services start mongodb-community${NC}"
    echo -e "   • Ubuntu: ${BLUE}sudo systemctl start mongod${NC}"
    echo -e "   • Windows: ${BLUE}net start MongoDB${NC}"
    exit 1
fi
echo -e "${GREEN}✅ MongoDB is running${NC}"

# Set test environment
export NODE_ENV=test
export DOTENV_CONFIG_PATH=.env.e2e

# Clean previous test database
echo -e "${YELLOW}🧹 Cleaning test database...${NC}"
mongosh mean-assessment-e2e-test --eval "db.dropDatabase()" --quiet 2>/dev/null || true
echo -e "${GREEN}✅ Test database cleaned${NC}"

# Run tests based on argument
case "${1:-all}" in
    "all")
        echo -e "${BLUE}🧪 Running all E2E tests...${NC}"
        jest --config test/jest-e2e.json --verbose
        ;;
    "auth")
        echo -e "${BLUE}🔐 Running authentication E2E tests...${NC}"
        jest --config test/jest-e2e.json auth.controller.e2e-spec.ts --verbose
        ;;
    "users")
        echo -e "${BLUE}👥 Running user management E2E tests...${NC}"
        jest --config test/jest-e2e.json user.controller.e2e-spec.ts --verbose
        ;;
    "products")
        echo -e "${BLUE}📦 Running product management E2E tests...${NC}"
        jest --config test/jest-e2e.json product.controller.e2e-spec.ts --verbose
        ;;
    "coverage")
        echo -e "${BLUE}📊 Running E2E tests with coverage...${NC}"
        jest --config test/jest-e2e.json --coverage --verbose
        ;;
    "watch")
        echo -e "${BLUE}👀 Running E2E tests in watch mode...${NC}"
        jest --config test/jest-e2e.json --watch --verbose
        ;;
    *)
        echo -e "${RED}❌ Invalid test option: $1${NC}"
        echo -e "${YELLOW}Available options:${NC}"
        echo -e "  • ${BLUE}all${NC}      - Run all E2E tests"
        echo -e "  • ${BLUE}auth${NC}     - Run authentication tests only"
        echo -e "  • ${BLUE}users${NC}    - Run user management tests only"
        echo -e "  • ${BLUE}products${NC} - Run product management tests only"
        echo -e "  • ${BLUE}coverage${NC} - Run tests with coverage report"
        echo -e "  • ${BLUE}watch${NC}    - Run tests in watch mode"
        exit 1
        ;;
esac

TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ All E2E tests passed successfully!${NC}"
else
    echo -e "${RED}❌ Some E2E tests failed. Check the output above for details.${NC}"
fi

# Clean up test database after tests
echo -e "${YELLOW}🧹 Cleaning up test database...${NC}"
mongosh mean-assessment-e2e-test --eval "db.dropDatabase()" --quiet 2>/dev/null || true
echo -e "${GREEN}✅ Test database cleanup completed${NC}"

exit $TEST_RESULT