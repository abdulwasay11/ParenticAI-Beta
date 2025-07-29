# Cloudflare Tunnel Setup for ParenticAI

## Overview
This guide helps you configure your ParenticAI application to work with a Cloudflare tunnel, allowing you to serve your local development environment through the domain `parenticai.com`.

## Prerequisites
- Cloudflare account with domain `parenticai.com`
- Cloudflare Tunnel (cloudflared) installed locally
- Docker and Docker Compose running locally

## Step 1: Install Cloudflare Tunnel
```bash
# Download and install cloudflared
# Visit: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Or use package manager
# Windows (with chocolatey):
choco install cloudflared

# macOS (with homebrew):
brew install cloudflare/cloudflare/cloudflared
```

## Step 2: Authenticate Cloudflare Tunnel
```bash
# Login to your Cloudflare account
cloudflared tunnel login

# This will open a browser window to authenticate
# Follow the prompts to authorize the tunnel
```

## Step 3: Create Tunnel Configuration
Create a file named `tunnel-config.yml` in your project root:

```yaml
tunnel: your-tunnel-id
credentials-file: /path/to/your/credentials.json

ingress:
  # Main application (Nginx handles all routing)
  - hostname: parenticai.com
    service: http://localhost:80
  
  - hostname: www.parenticai.com
    service: http://localhost:80
  
  - hostname: api.parenticai.com
    service: http://localhost:80
  
  - hostname: auth.parenticai.com
    service: http://localhost:80
  
  - hostname: ai.parenticai.com
    service: http://localhost:80
  
  # Catch-all rule
  - service: http_status:404
```

## Step 4: Start the Tunnel
```bash
# Start the tunnel with your configuration
cloudflared tunnel --config tunnel-config.yml run

# Or run in the background
cloudflared tunnel --config tunnel-config.yml run --daemon
```

## Step 5: Update DNS Records
In your Cloudflare dashboard:
1. Go to DNS settings for `parenticai.com`
2. Add CNAME records:
   - `parenticai.com` → `your-tunnel-id.cfargotunnel.com`
   - `api.parenticai.com` → `your-tunnel-id.cfargotunnel.com`
   - `auth.parenticai.com` → `your-tunnel-id.cfargotunnel.com`
   - `ai.parenticai.com` → `your-tunnel-id.cfargotunnel.com`

## Step 6: Start Your Application
```bash
# Start all services
docker-compose up -d

# Or start individual services
docker-compose up -d postgres chroma keycloak ollama backend frontend
```

## Step 7: Verify Setup
1. Visit `https://parenticai.com` - should show your React frontend
2. Test API at `https://api.parenticai.com/health`
3. Test authentication at `https://auth.parenticai.com`

## Environment Variables Summary

### Frontend (.env or docker-compose.yml)
```env
REACT_APP_API_URL=https://api.parenticai.com
REACT_APP_KEYCLOAK_URL=https://auth.parenticai.com
REACT_APP_KEYCLOAK_REALM=parentic-ai
REACT_APP_KEYCLOAK_CLIENT_ID=parentic-client
HOST=0.0.0.0
PORT=3000
```

### Backend (docker-compose.yml)
```env
DATABASE_URL=postgresql://parentic_user:parentic_password@postgres:5432/parentic_ai
CHROMA_URL=http://chroma:8000
OLLAMA_URL=http://ollama:11434
KEYCLOAK_URL=http://keycloak:8080
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure backend CORS includes your domain
2. **SSL Issues**: Cloudflare handles SSL, ensure `KC_PROXY=edge` in Keycloak
3. **Connection Timeouts**: Check if tunnel is running and DNS is updated
4. **Port Conflicts**: Ensure local ports 3000, 8001, 8080 are available

### Debug Commands:
```bash
# Check tunnel status
cloudflared tunnel list

# Check tunnel logs
cloudflared tunnel logs your-tunnel-id

# Test local services
curl http://localhost:3000
curl http://localhost:8001/health
curl http://localhost:8080
```

## Security Considerations
1. **Environment Variables**: Use strong secrets in production
2. **CORS**: Only allow necessary origins
3. **Authentication**: Configure Keycloak properly for production
4. **Database**: Use strong passwords and consider external database
5. **SSL**: Cloudflare provides SSL, but ensure proper configuration

## Production Recommendations
1. Use environment-specific configuration files
2. Implement proper logging and monitoring
3. Set up automated backups for database
4. Configure rate limiting and security headers
5. Use Cloudflare's security features (WAF, DDoS protection) 