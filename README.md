# ParenticAI - AI-Powered Parenting Assistant

ParenticAI is a comprehensive web application that provides AI-powered parenting assistance, child profile management, and intelligent chat support for parents. Built with modern technologies including React, FastAPI, PostgreSQL, Vector Database, and Local Llama 3.2 integration.

## 🚀 Features

- **🔐 Secure Authentication**: Keycloak integration for secure user management
- **👤 Parent Profiles**: Comprehensive parent profile creation and management
- **👶 Child Management**: Detailed child profiles with interests, hobbies, and personality traits
- **🤖 AI Chat Assistant**: Local Llama 3.2 powered conversational AI for parenting advice
- **📊 Vector Database**: Persistent storage of child data and chat history using Chroma
- **🧠 Personality Assessment**: Image-based personality analysis (Coming Soon)
- **📈 Chat History**: Searchable conversation history with context awareness
- **🎨 Modern UI**: Beautiful, responsive design with soft colors and smooth animations

## 🏗️ Architecture

### Services
- **Frontend**: React 18 with TypeScript, Material-UI, and Framer Motion
- **Backend**: FastAPI with Python 3.11
- **Database**: PostgreSQL 15 for relational data
- **Vector Database**: ChromaDB for semantic search and chat history
- **Authentication**: Keycloak for secure user management
- **AI Model**: Ollama with Llama 3.2 for local AI processing
- **Containerization**: Docker and Docker Compose for easy deployment

### Tech Stack

#### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for components
- Framer Motion for animations
- React Router for navigation
- React Query for state management
- Axios for API calls
- Keycloak-js for authentication

#### Backend
- FastAPI for REST API
- SQLAlchemy for ORM
- Alembic for database migrations
- ChromaDB for vector operations
- Ollama integration for local LLM
- Pydantic for data validation
- Python-Keycloak for authentication

## 🔧 Prerequisites

- Docker and Docker Compose
- Git
- At least 8GB RAM (for Ollama/Llama 3.2)
- NVIDIA GPU (optional, for better AI performance)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ParenticAI_Beta
```

### 2. Run the Setup Script
```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- Start all services with Docker Compose
- Pull the Llama 3.2 model
- Set up the database
- Configure Keycloak realm

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **Keycloak Admin**: http://localhost:8080 (admin/admin123)
- **API Documentation**: http://localhost:8001/docs

## 🔨 Manual Setup

If you prefer to set up manually:

### 1. Start Services
```bash
docker-compose up -d
```

### 2. Wait for Services to Start
Wait 2-3 minutes for all services to initialize.

### 3. Pull Llama 3.2 Model
```bash
docker exec -it parentic_ollama ollama pull llama3.2
```

### 4. Configure Keycloak
1. Go to http://localhost:8080
2. Login with admin/admin123
3. Create realm "parentic-ai"
4. Create client "parentic-client"
5. Configure client settings (see detailed instructions below)

## ⚙️ Configuration

### Environment Variables

Create `.env` files in frontend and backend directories:

#### Backend `.env`
```env
DATABASE_URL=postgresql://parentic_user:parentic_password@postgres:5432/parentic_ai
CHROMA_URL=http://chroma:8000
OLLAMA_URL=http://ollama:11434
KEYCLOAK_URL=http://keycloak:8080
JWT_SECRET=your-super-secret-jwt-key-change-in-production
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
```

#### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:8001
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=parentic-ai
REACT_APP_KEYCLOAK_CLIENT_ID=parentic-client
```

### Keycloak Configuration

#### 1. Create Realm
1. Login to Keycloak admin console
2. Click "Add realm"
3. Name: "parentic-ai"
4. Click "Create"

#### 2. Create Client
1. Go to Clients → Create
2. Client ID: "parentic-client"
3. Client Protocol: "openid-connect"
4. Root URL: "http://localhost:3000"

#### 3. Configure Client Settings
- Access Type: "public"
- Valid Redirect URIs: "http://localhost:3000/*"
- Web Origins: "http://localhost:3000"
- Admin URL: "http://localhost:3000"

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React application |
| Backend | 8001 | FastAPI server |
| PostgreSQL | 5433 | Primary database |
| ChromaDB | 8000 | Vector database |
| Keycloak | 8080 | Authentication server |
| Ollama | 11434 | Local LLM service |

## 📊 Database Schema

### Users Table
- User authentication and profile info
- Linked to Keycloak identity

### Parents Table
- Parent-specific information
- Parenting style, experience, goals

### Children Table
- Child profiles with detailed information
- Hobbies, interests, personality traits
- Stored in both PostgreSQL and ChromaDB

### Chat Messages Table
- Conversation history
- User messages and AI responses
- Also stored in ChromaDB for semantic search

## 🤖 AI Integration

### Local Llama 3.2
- Runs locally via Ollama
- Provides personalized parenting advice
- Uses family context for better responses
- No data sent to external services

### Vector Database
- ChromaDB for semantic search
- Stores child information and chat history
- Enables context-aware conversations
- Facilitates relevant information retrieval

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Database Migrations
```bash
cd backend
alembic upgrade head
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
pytest
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

## 📝 API Documentation

The API documentation is automatically generated and available at:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Main Endpoints

#### Authentication
- `GET /api/users/me` - Get current user
- `POST /api/users/` - Create user

#### Parent Profiles
- `GET /api/parents/me` - Get parent profile
- `POST /api/parents/` - Create parent profile
- `PUT /api/parents/me` - Update parent profile

#### Children Management
- `GET /api/children/` - List children
- `POST /api/children/` - Add child
- `PUT /api/children/{id}` - Update child

#### AI Chat
- `POST /api/chat/` - Send message to AI
- `GET /api/chat/history` - Get chat history

## 🚨 Troubleshooting

### Quick Fix
If you encounter issues during setup, run:
```bash
chmod +x quick-fix.sh
./quick-fix.sh
```

For detailed diagnostics:
```bash
chmod +x troubleshoot.sh
./troubleshoot.sh
```

### Common Issues

#### Keycloak Takes Long to Start
- Keycloak can take 2-3 minutes to fully start
- Check logs: `docker logs parentic_keycloak`
- If it fails, restart: `docker restart parentic_keycloak`
- Wait another 2-3 minutes after restart

#### Port Conflicts
- PostgreSQL runs on port 5433 (changed from 5432 to avoid conflicts)
- If other ports conflict, modify the ports in docker-compose.yml

#### Keycloak Connection Issues
- Ensure Keycloak is fully started (takes 2-3 minutes)
- Check if realm and client are properly configured
- Verify redirect URLs match exactly

#### Ollama Model Loading
- Ensure sufficient RAM (8GB+)
- Check Ollama logs: `docker logs parentic_ollama`
- Manually pull model: `docker exec -it parentic_ollama ollama pull llama3.2`

#### Database Connection Issues
- Wait for PostgreSQL to fully initialize
- Check database logs: `docker logs parentic_postgres`
- Verify database credentials in environment variables

#### Frontend Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors
- Ensure all environment variables are set

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres
docker-compose logs keycloak
docker-compose logs ollama
docker-compose logs chroma
```

## 🔒 Security Considerations

- Change default passwords in production
- Use environment variables for sensitive data
- Configure proper CORS settings
- Set up SSL/TLS for production
- Regular security updates for dependencies

## 🚀 Production Deployment

### Environment Setup
1. Set strong passwords for all services
2. Configure SSL certificates
3. Set up proper firewall rules
4. Use Docker secrets for sensitive data
5. Configure backup strategies

### Scaling Considerations
- Use managed PostgreSQL service
- Consider Redis for session management
- Implement load balancing for frontend
- Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review Docker logs for error details

---

Built with ❤️ for parents everywhere by the ParenticAI team. # ParenticAI-Beta
