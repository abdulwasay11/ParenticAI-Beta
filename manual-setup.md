# ParenticAI Manual Setup Guide

Due to SSL issues with Docker package installation, here's how to get ParenticAI running manually:

## 🚀 Current Status
- ✅ All Docker services are running (Frontend, Database, Keycloak, Ollama, ChromaDB)
- ❌ Backend needs manual setup due to SSL package download issues
- ✅ Frontend is accessible at http://localhost:3000

## 📋 Quick Manual Backend Setup

### 1. Install Python Dependencies Locally
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux
# or on Windows: venv\Scripts\activate

# Install required packages manually
pip install fastapi==0.104.1
pip install uvicorn==0.24.0
pip install python-dotenv==1.0.0
```

### 2. Run the Backend API
```bash
# From the backend directory
python main.py
```

The backend will start on http://localhost:8000 (but we need port 8001)

### 3. Run on Correct Port
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## 🔧 Alternative: Use Docker Without SSL
If you want to try Docker again:

```bash
# Stop the problematic backend container
docker stop parentic_backend

# Run backend manually with a simpler approach
docker run -it --rm \
  --network parenticai_beta_parentic_network \
  -p 8001:8000 \
  -v $(pwd)/backend:/app \
  -w /app \
  python:3.11-slim \
  bash -c "pip install fastapi uvicorn python-dotenv && python main.py"
```

## 🎯 Test Everything

### 1. Check All Services
```bash
# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8001/health

# Test Keycloak
curl http://localhost:8080

# Test Database
docker exec parentic_postgres pg_isready -U parentic_user

# Test Ollama
curl http://localhost:11434/api/tags

# Test ChromaDB
curl http://localhost:8000/api/v1/heartbeat
```

### 2. Use the Frontend Interface
1. Go to http://localhost:3000
2. Click "Test Backend Connection" 
3. Click "Open Keycloak Admin"
4. Verify all services show green checkmarks

## 📝 Next Steps Once Backend is Running

### 1. Configure Keycloak
1. Go to http://localhost:8080
2. Login: `admin` / `admin123`
3. Create realm: `parentic-ai`
4. Create client: `parentic-client`
5. Set client configuration:
   - Access Type: `public`
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`

### 2. Install AI Model
```bash
docker exec -it parentic_ollama ollama pull llama3.2
```

### 3. Verify Everything Works
- Frontend: ✅ http://localhost:3000
- Backend API: ✅ http://localhost:8001/docs  
- Keycloak: ✅ http://localhost:8080
- All services responding: ✅

## 🚀 Development Workflow

For development, you can now:
1. Keep Docker services running (DB, Keycloak, Ollama, ChromaDB)
2. Run backend manually with Python
3. Frontend already running in Docker
4. Make changes and test locally

## 🔧 Troubleshooting

### Backend Issues
```bash
# Check Python version
python3 --version

# Check if port is free
lsof -i :8001

# Check backend logs
# (when running manually, logs appear in terminal)
```

### Docker Issues
```bash
# Check all containers
docker ps

# Check specific service logs
docker logs parentic_frontend
docker logs parentic_postgres
docker logs parentic_keycloak
```

## 📈 Success Indicators

You'll know everything is working when:
1. ✅ Frontend shows all services as connected
2. ✅ "Test Backend Connection" button returns JSON response  
3. ✅ Keycloak admin console loads properly
4. ✅ All Docker containers are running

## 🎯 Ultimate Goal

Once this manual setup works, we can:
1. ✅ Add authentication with Keycloak
2. ✅ Implement parent/child profiles  
3. ✅ Add AI chat with Llama 3.2
4. ✅ Enable vector database for chat history
5. ✅ Build personality assessment feature

---

**The core infrastructure is working! We just need to bypass the Docker SSL issue for now.** 🚀 