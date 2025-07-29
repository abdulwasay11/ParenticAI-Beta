# ParenticAI Frontend

This is the React frontend for ParenticAI, configured to build static files for production deployment.

## Build Process

The frontend is now configured to build static files that can be served by any web server. The build process:

1. **Development**: Uses React development server for local development
2. **Production**: Builds static files optimized for production deployment

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker (for containerized deployment)

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Building for Production

```bash
# Build static files
npm run build

# The build output will be in the 'build' directory
```

### Using Build Scripts

**Windows:**
```bash
# Build static files
build.bat

# Serve built files locally
serve-static.bat
```

**Linux/Mac:**
```bash
# Make scripts executable
chmod +x build.sh serve-static.sh

# Build static files
./build.sh

# Serve built files locally
./serve-static.sh
```

## Docker Deployment

The frontend is configured with a multi-stage Docker build:

1. **Build Stage**: Compiles React app to static files
2. **Production Stage**: Uses nginx to serve static files

### Building Docker Image

```bash
docker build -t parentic-frontend .
```

### Running with Docker Compose

```bash
# From project root
docker-compose up frontend
```

## Static File Configuration

The built static files are served by nginx with the following optimizations:

- **Gzip compression** for faster loading
- **Cache headers** for static assets
- **React Router support** (SPA routing)
- **Security headers** for production
- **API proxy** configuration

## Environment Variables

Configure these environment variables for your deployment:

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_KEYCLOAK_URL`: Keycloak authentication URL
- `REACT_APP_KEYCLOAK_REALM`: Keycloak realm name
- `REACT_APP_KEYCLOAK_CLIENT_ID`: Keycloak client ID

## File Structure

```
frontend/
├── build/                 # Built static files (generated)
├── public/               # Static assets
├── src/                  # React source code
├── nginx.conf           # Nginx configuration for static serving
├── Dockerfile           # Multi-stage Docker build
├── build.sh             # Linux/Mac build script
├── build.bat            # Windows build script
├── serve-static.sh      # Linux/Mac serve script
├── serve-static.bat     # Windows serve script
└── package.json         # Dependencies and scripts
```

## Performance Optimizations

The build process includes:

- **Code splitting** for better loading performance
- **Asset optimization** (minification, compression)
- **Tree shaking** to remove unused code
- **Static asset caching** with long-term cache headers

## Troubleshooting

### Build Issues

1. **Node modules not found**: Run `npm install`
2. **Build fails**: Check for TypeScript errors in `src/`
3. **Port conflicts**: Change port in `serve-static` scripts

### Docker Issues

1. **Build context too large**: Add `.dockerignore` file
2. **Nginx configuration errors**: Check `nginx.conf` syntax
3. **Static files not loading**: Verify build output in container

### Runtime Issues

1. **API calls failing**: Check `REACT_APP_API_URL` configuration
2. **Authentication issues**: Verify Keycloak configuration
3. **Routing problems**: Ensure nginx is configured for SPA routing 